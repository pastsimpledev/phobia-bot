import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { NewMessage } from 'telegram/events/index.js'

// --- CONFIGURAZIONE ---
const apiId = 2040;
const apiHash = 'b18441a1ff607e10a989891a5462e627';
const targetBotId = "573215575562"; 
const sessionSaved = "1BAAOMTQ5LjE1NC4xNjcuOTEAUB9OQLQkNqxtxPwutWa2/cpTA8jxTWL1WgZojzgQL+RSVbiUMnVC71ydpMfscNdF5bCR9ijjwkkb3SD5/LRFNC+KGpPiJBDNr48MAT1TQZI9WA/Ld/RhjKu2/jThMk5pnJ3pSzDF3eWaD3KOjVqPNRQ5diSpO55KVHvkWp10albKXG1yXFOSOrcT7i8tg+hRNqfIWp334sXiYt6o+WP+JuSQXeheXMRvPIo17H/vVIbQN66hVsxOa/SKQgzzhQD9fXNeOIoSO6owjtJsmbwH1r9b/OB+hZ3J7Xd9o4gjv9clALS2SyB+A/Vs2/V4j/I/oKAFUpS7DbwoVD1oJ5Xh90A";

global.tgVoip = global.tgVoip || {
    client: null,
    conn: null,
    chatId: null,
    isListening: false,
    currentButtons: [] 
};

let handler = async (m, { conn, text }) => {
    if (m.isGroup) return;
    global.tgVoip.conn = conn;
    global.tgVoip.chatId = m.chat;

    try {
        if (!global.tgVoip.client || !global.tgVoip.client.connected) {
            global.tgVoip.client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, { connectionRetries: 5 });
            await global.tgVoip.client.connect();
        }

        // --- SOLUZIONE ERRORE ENTITY ---
        // Forziamo il client a trovare il bot tramite l'ID
        const botEntity = await global.tgVoip.client.getEntity(targetBotId);

        if (!global.tgVoip.isListening) {
            global.tgVoip.client.addEventHandler(async (event) => {
                const message = event.message;
                if (!message) return;

                const senderId = message.peerId?.userId?.toString() || message.senderId?.toString();
                if (senderId !== targetBotId) return;

                let testoCorpo = message.message || "";
                let listaNumerata = "";
                let nuoviBottoni = [];

                if (message.replyMarkup && message.replyMarkup.rows) {
                    let count = 1;
                    listaNumerata = "\n\n🔢 *OPZIONI:*\n";
                    for (const row of message.replyMarkup.rows) {
                        for (const button of row.buttons) {
                            if (button.text) {
                                nuoviBottoni.push({ msg: message, btn: button });
                                listaNumerata += `*${count}* - ${button.text}\n`;
                                count++;
                            }
                        }
                    }
                }

                global.tgVoip.currentButtons = nuoviBottoni;
                let messaggioFinale = `🤖 *TELEGRAM*\n\n${testoCorpo}${listaNumerata}`;

                if (global.tgVoip.conn && global.tgVoip.chatId) {
                    await global.tgVoip.conn.sendMessage(global.tgVoip.chatId, { text: messaggioFinale });
                }
            }, new NewMessage({ incoming: true }));
            global.tgVoip.isListening = true;
        }

        // Usiamo l'entità risolta per inviare il messaggio
        await global.tgVoip.client.sendMessage(botEntity, { message: text || "/start" });
        await m.react('📡');

    } catch (e) {
        console.error("Errore avvio sessione Telegram:", e);
        m.reply("⚠️ Errore: Il client non riesce a trovare il bot. Assicurati che l'ID sia corretto.");
    }
}

handler.before = async (m) => {
    if (m.isGroup || !m.text || m.text.startsWith('.') || !global.tgVoip?.client) return;
    if (m.chat !== global.tgVoip.chatId) return;

    const input = m.text.trim();
    const numeroScelto = parseInt(input);
    const bottoni = global.tgVoip.currentButtons || [];

    try {
        const botEntity = await global.tgVoip.client.getEntity(targetBotId);

        if (!isNaN(numeroScelto) && numeroScelto > 0 && numeroScelto <= bottoni.length) {
            const target = bottoni[numeroScelto - 1];
            await m.react('🔘');
            await target.msg.click(target.btn);
            return true;
        }

        await global.tgVoip.client.sendMessage(botEntity, { message: input });
        await m.react('📤');
    } catch (e) {
        console.error("Errore prima del click/invio:", e);
    }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
