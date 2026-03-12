import { GoogleGenerativeAI } from "@google/generative-ai";

// Configurazione IA - Prendi la chiave su https://aistudio.google.com/
const GEN_AI_KEY = "METTI_QUI_LA_TUA_API_KEY";
const genAI = new GoogleGenerativeAI(GEN_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let handler = async (m, { conn, store, isOwner, participants }) => {
    const chatId = m.chat;
    const adminList = participants.filter(p => p.admin).map(p => p.id);
    const ownerNumber = global.owner[0][0] + '@s.whatsapp.net'; // Prende il numero dell'owner dai global

    if (!store || !store.messages[chatId]) throw "*❌ Errore:* Non riesco ad accedere alla cronologia dei messaggi.";

    let msgs = store.messages[chatId].array.slice(-100); // Analizziamo un range più ampio (100 messaggi)
    
    // Contatori per le statistiche
    let stats = {
        totalMsgs: msgs.length,
        tags: 0,
        ownerTags: 0,
        links: 0,
        removedCount: 0,
        mediaCount: 0
    };

    let chatText = [];

    for (let msg of msgs) {
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        const mType = Object.keys(msg.message || {})[0];

        // 1. Conteggio Link
        if (/https?:\/\/[^\s]+/.test(text)) stats.links++;

        // 2. Conteggio Tag e Tag Owner
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            let mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid;
            stats.tags += mentioned.length;
            if (mentioned.includes(ownerNumber)) stats.ownerTags++;
        }

        // 3. Conteggio Media
        if (['imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage'].includes(mType)) stats.mediaCount++;

        // 4. Analisi azioni (Rimozioni) - Questo dipende da come lo store salva i protocolli
        if (msg.messageStubType === 28 || msg.messageStubType === 32) stats.removedCount++;

        // Salvataggio testo per IA (solo se c'è testo)
        if (text) {
            let name = msg.pushName || 'Utente';
            chatText.push(`${name}: ${text}`);
        }
    }

    await conn.reply(chatId, `🩸 *BloodBot sta analizzando i dati...*`, m);

    try {
        const prompt = `Sei l'assistente di BloodBot. Riassumi brevemente l'atmosfera e i discorsi di questa chat in 3-4 frasi d'impatto:\n\n${chatText.join('\n')}`;
        const result = await model.generateContent(prompt);
        const aiSummary = result.response.text();

        // Costruzione del Report Visivo
        let report = `📊 *REPORT ATTIVITÀ BLOODBOT*\n`;
        report += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        report += `📝 *Riassunto IA:*\n${aiSummary}\n\n`;
        report += `📈 *Statistiche (ultimi 100 msg):*\n`;
        report += `┌  💬 Messaggi totali: ${stats.totalMsgs}\n`;
        report += `│  🔗 Link inviati: ${stats.links}\n`;
        report += `│  🖼️ Media (foto/video): ${stats.mediaCount}\n`;
        report += `│  🏷️ Tag totali: ${stats.tags}\n`;
        report += `│  👑 Tag all'Owner: ${stats.ownerTags}\n`;
        report += `└  🚫 Utenti rimossi: ${stats.removedCount}\n\n`;
        report += `🩸 _BloodBot Monitoring_`;

        await conn.reply(chatId, report, m);

    } catch (e) {
        console.error(e);
        throw `*❌ Errore durante l'analisi dati.*`;
    }
};

handler.help = ['riassunto'];
handler.tags = ['info'];
handler.command = /^(riassunto|recap|stats)$/i;
handler.group = true;
handler.register = true;

export default handler;
