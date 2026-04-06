import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { NewMessage } from 'telegram/events/index.js'

// --- CONFIGURAZIONE ---
const apiId = 2040; 
const apiHash = 'b18441a1ff607e10a989891a5462e627'; 
const targetBotId = "5916422327"; // ID fisso di Number_Nest_Bot
const sessionSaved = "1BAAOMTQ5LjE1NC4xNjcuOTEAUB9OQLQkNqxtxPwutWa2/cpTA8jxTWL1WgZojzgQL+RSVbiUMnVC71ydpMfscNdF5bCR9ijjwkkb3SD5/LRFNC+KGpPiJBDNr48MAT1TQZI9WA/Ld/RhjKu2/jThMk5pnJ3pSzDF3eWaD3KOjVqPNRQ5diSpO55KVHvkWp10albKXG1yXFOSOrcT7i8tg+hRNqfIWp334sXiYt6o+WP+JuSQXeheXMRvPIo17H/vVIbQN66hVsxOa/SKQgzzhQD9fXNeOIoSO6owjtJsmbwH1r9b/OB+hZ3J7Xd9o4gjv9clALS2SyB+A/Vs2/V4j/I/oKAFUpS7DbwoVD1oJ5Xh90A";

let client = null;
let isConnecting = false;

let handler = async (m, { conn, text }) => {
  if (m.isGroup) return;

  try {
    // Evita doppie connessioni simultanee
    if (isConnecting) return;

    if (!client || !client.connected) {
      isConnecting = true;
      client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, {
        connectionRetries: 5,
      });

      await client.connect();
      isConnecting = false;
      console.log("✅ PONTE TELEGRAM CONNESSO");

      // GESTORE EVENTI: Riceve da Telegram -> Invia a WhatsApp
      client.addEventHandler(async (event) => {
        const message = event.message;
        if (!message || !message.text) return;

        const senderId = message.senderId ? message.senderId.toString() : "";
        
        // Se il messaggio viene dal bot target
        if (senderId.includes(targetBotId) || senderId.includes("5916422327")) {
            await conn.sendMessage(m.chat, {
                text: `🤖 *RISPOSTA DA TELEGRAM*\n\n${message.text}`,
                contextInfo: {
                    externalAdReply: {
                        title: "✧ VOIP RELAY ✧",
                        body: "Messaggio ricevuto correttamente",
                        thumbnailUrl: "https://telegra.ph/file/0c326071415053272d76c.jpg",
                        showAdAttribution: true
                    }
                }
            });
        }
      }, new NewMessage({}));
    }

    // Invio comando a Telegram
    const toSend = text ? text : "/start";
    await client.sendMessage("Number_Nest_Bot", { message: toSend });
    await m.react('📡');

  } catch (e) {
    isConnecting = false;
    console.error(e);
    m.reply(`❌ Errore: ${e.message}`);
  }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
