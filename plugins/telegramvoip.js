import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { NewMessage } from 'telegram/events/index.js'

// --- CONFIGURAZIONE ---
const apiId = 2040;
const apiHash = 'b18441a1ff607e10a989891a5462e627';
const targetBotUsername = "Number_Nest_Bot";
const sessionSaved = "1BAAOMTQ5LjE1NC4xNjcuOTEAUB9OQLQkNqxtxPwutWa2/cpTA8jxTWL1WgZojzgQL+RSVbiUMnVC71ydpMfscNdF5bCR9ijjwkkb3SD5/LRFNC+KGpPiJBDNr48MAT1TQZI9WA/Ld/RhjKu2/jThMk5pnJ3pSzDF3eWaD3KOjVqPNRQ5diSpO55KVHvkWp10albKXG1yXFOSOrcT7i8tg+hRNqfIWp334sXiYt6o+WP+JuSQXeheXMRvPIo17H/vVIbQN66hVsxOa/SKQgzzhQD9fXNeOIoSO6owjtJsmbwH1r9b/OB+hZ3J7Xd9o4gjv9clALS2SyB+A/Vs2/V4j/I/oKAFUpS7DbwoVD1oJ5Xh90A";

// STATO GLOBALE ESTESO
global.tgVoip = global.tgVoip || {
    client: null,
    conn: null,
    currentUser: null, // ID utente che sta usando il bot
    queue: [],         // Coda di utenti [{chatId, name, timestamp}]
    isMonitoring: false, // Se attivo, inoltra tutto per 4 minuti
    monitorTimer: null,
    queueTimer: null,
    currentButtons: [],
    isListening: false
};

let handler = async (m, { conn, text }) => {
    if (m.isGroup) return;
    const userId = m.chat;

    // 1. GESTIONE CODA
    if (global.tgVoip.currentUser && global.tgVoip.currentUser !== userId) {
        if (!global.tgVoip.queue.find(q => q.chatId === userId)) {
            global.tgVoip.queue.push({ chatId: userId, name: m.pushName });
        }
        const pos = global.tgVoip.queue.findIndex(q => q.chatId === userId) + 1;
        return m.reply(`⚠️ Il bot è occupato. Sei in posizione *${pos}* della coda.\nAttendi il tuo turno.`);
    }

    global.tgVoip.currentUser = userId;
    global.tgVoip.conn = conn;
    global.tgVoip.chatId = userId;

    try {
        if (!global.tgVoip.client || !global.tgVoip.client.connected) {
            global.tgVoip.client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, { connectionRetries: 5 });
            await global.tgVoip.client.connect();
        }

        if (!global.tgVoip.isListening) {
            global.tgVoip.client.addEventHandler(async (event) => {
                const message = event.message;
                if (!message || !message.peerId) return;
                const sender = await message.getSender();
                if (sender?.username !== targetBotUsername && message.senderId?.toString() !== targetBotUsername) return;

                let testoCorpo = message.message || "";
                let listaNumerata = "";
                let bottoniTrovati = [];

                // Rilevamento OTP
                const otpMatch = testoCorpo.match(/\b\d{6}\b/);
                if (otpMatch) testoCorpo = `🔑 *CODICE RICEVUTO: ${otpMatch[0]}*\n\n` + testoCorpo;

                // Estrazione Bottoni
                if (message.replyMarkup?.rows) {
                    let count = 1;
                    listaNumerata = "\n\n🔘 *SELEZIONA OPZIONE:*\n";
                    for (const row of message.replyMarkup.rows) {
                        for (const button of row.buttons) {
                            if (button.text && !(message.replyMarkup instanceof Api.ReplyKeyboardMarkup)) {
                                bottoniTrovati.push({ msg: message, btn: button });
                                listaNumerata += `*${count}* - ${button.text}\n`;
                                count++;
                            }
                        }
                    }
                }

                global.tgVoip.currentButtons = bottoniTrovati;

                // Invio a WhatsApp (Solo se siamo l'utente attivo o se il monitoraggio è attivo)
                if (global.tgVoip.currentUser) {
                    let messaggioFinale = `🤖 *DA TELEGRAM*\n\n${testoCorpo}${listaNumerata}`;
                    await global.tgVoip.conn.sendMessage(global.tgVoip.chatId, { text: messaggioFinale });
                }
            }, new NewMessage({ incoming: true }));
            global.tgVoip.isListening = true;
        }

        await global.tgVoip.client.sendMessage(targetBotUsername, { message: text || "/start" });
        await m.react('📡');

        // Reset timer inattività (2 minuti per iniziare)
        startInactivityTimer(conn);

    } catch (e) {
        console.error(e);
        resetSession();
    }
}

handler.before = async (m) => {
    if (m.isGroup || !m.text || m.text.startsWith('.') || !global.tgVoip?.client) return;
    if (m.chat !== global.tgVoip.currentUser) return;

    const input = m.text.trim();
    const numeroScelto = parseInt(input);
    const bottoni = global.tgVoip.currentButtons || [];

    if (!isNaN(numeroScelto) && bottoni.length > 0 && bottoni[numeroScelto - 1]) {
        try {
            const target = bottoni[numeroScelto - 1];
            await m.react('🔘');
            await target.msg.click(target.btn);
            
            // --- LOGICA 4 MINUTI ---
            await m.reply("✅ Opzione scelta. Monitoraggio attivo per **4 minuti**. Riceverai ogni aggiornamento qui.");
            
            if (global.tgVoip.monitorTimer) clearTimeout(global.tgVoip.monitorTimer);
            global.tgVoip.monitorTimer = setTimeout(() => {
                m.reply("⌛ Tempo di monitoraggio (4 min) scaduto. Sessione terminata.");
                resetSession();
            }, 4 * 60 * 1000);

            return;
        } catch (err) { console.error(err); }
    }

    try {
        await global.tgVoip.client.sendMessage(targetBotUsername, { message: m.text });
        await m.react('📤');
    } catch (e) { console.error(e); }
}

// Funzione per gestire il passaggio al prossimo utente
async function resetSession() {
    if (global.tgVoip.monitorTimer) clearTimeout(global.tgVoip.monitorTimer);
    if (global.tgVoip.queueTimer) clearTimeout(global.tgVoip.queueTimer);
    
    global.tgVoip.currentUser = null;
    global.tgVoip.currentButtons = [];

    if (global.tgVoip.queue.length > 0) {
        const nextUser = global.tgVoip.queue.shift();
        global.tgVoip.currentUser = nextUser.chatId;
        global.tgVoip.chatId = nextUser.chatId;

        await global.tgVoip.conn.sendMessage(nextUser.chatId, "🎟️ Tocca a te! Hai **2 minuti** per inviare un comando o la sessione passerà al prossimo.");
        
        // Timer 2 minuti per inattività utente in coda
        startInactivityTimer(global.tgVoip.conn);
    }
}

function startInactivityTimer(conn) {
    if (global.tgVoip.queueTimer) clearTimeout(global.tgVoip.queueTimer);
    global.tgVoip.queueTimer = setTimeout(async () => {
        if (global.tgVoip.currentUser) {
            await conn.sendMessage(global.tgVoip.chatId, "⏰ Tempo scaduto per inattività. Sessione chiusa.");
            resetSession();
        }
    }, 2 * 60 * 1000);
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
