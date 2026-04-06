import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { NewMessage } from 'telegram/events/index.js'

// --- CONFIGURAZIONE ---
const apiId = 2040; 
const apiHash = 'b18441a1ff607e10a989891a5462e627'; 
const targetBotId = "5916422327"; 
const sessionSaved = "1BAAOMTQ5LjE1NC4xNjcuOTEAUB9OQLQkNqxtxPwutWa2/cpTA8jxTWL1WgZojzgQL+RSVbiUMnVC71ydpMfscNdF5bCR9ijjwkkb3SD5/LRFNC+KGpPiJBDNr48MAT1TQZI9WA/Ld/RhjKu2/jThMk5pnJ3pSzDF3eWaD3KOjVqPNRQ5diSpO55KVHvkWp10albKXG1yXFOSOrcT7i8tg+hRNqfIWp334sXiYt6o+WP+JuSQXeheXMRvPIo17H/vVIbQN66hVsxOa/SKQgzzhQD9fXNeOIoSO6owjtJsmbwH1r9b/OB+hZ3J7Xd9o4gjv9clALS2SyB+A/Vs2/V4j/I/oKAFUpS7DbwoVD1oJ5Xh90A";

let client = null;

let handler = async (m, { conn, text }) => {
  if (m.isGroup) return;

  // 1. Inizializzazione Unica
  if (!global.tgClient) {
    console.log("🚀 Avvio Ponte Telegram...");
    global.tgClient = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, {
      connectionRetries: 5,
    });
    await global.tgClient.connect();
    
    // Registra l'ascoltatore una volta sola per sempre
    global.tgClient.addEventHandler(async (event) => {
      const message = event.message;
      if (!message || !message.text) return;
      
      const senderId = message.senderId ? message.senderId.toString() : "";
      if (senderId.includes(targetBotId)) {
        // Invia a WhatsApp (usa l'ultimo JID che ha usato il comando)
        await conn.sendMessage(global.lastVoipJid, {
          text: `🤖 *TELEGRAM:*\n\n${message.text}`,
          contextInfo: {
            externalAdReply: {
              title: "VOIP RELAY",
              body: "Rispondi a questo messaggio per replicare",
              showAdAttribution: true,
              thumbnailUrl: "https://telegra.ph/file/0c326071415053272d76c.jpg"
            }
          }
        });
      }
    }, new NewMessage({}));
    console.log("✅ Ponte Pronto.");
  }

  // Memorizziamo chi sta usando il comando per sapere a chi mandare le risposte
  global.lastVoipJid = m.chat;

  try {
    // 2. Invio Messaggio
    const toSend = text ? text : "/start";
    await global.tgClient.sendMessage("Number_Nest_Bot", { message: toSend });
    await m.react('📡');
  } catch (e) {
    m.reply(`❌ Errore Invio: ${e.message}`);
  }
}

// --- LOGICA PER RISPONDERE DIRETTAMENTE ---
handler.before = async (m) => {
  // Se l'utente risponde (reply) a un messaggio del bot su WhatsApp
  if (m.quoted && m.quoted.text && m.quoted.text.includes("TELEGRAM:") && global.tgClient) {
    await global.tgClient.sendMessage("Number_Nest_Bot", { message: m.text });
    await m.react('📨');
    return true;
  }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
