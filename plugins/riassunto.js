import { GoogleGenerativeAI } from "@google/generative-ai";

// Configurazione IA (Inserisci la tua chiave tra le virgolette)
const GEN_AI_KEY = "METTI_QUI_LA_TUA_API_KEY";
const genAI = new GoogleGenerativeAI(GEN_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let handler = async (m, { conn, store, usedPrefix, command }) => {
    const chatId = m.chat;

    // 1. Controllo se lo store è attivo
    if (!store || !store.messages || !store.messages[chatId]) {
        throw `*❌ Errore:* Lo store non sta registrando i messaggi. Assicurati che sia attivo nel file principale.`;
    }

    // 2. Recupero degli ultimi 40 messaggi testuali
    let msgs = store.messages[chatId].array.slice(-40);
    
    // Filtriamo solo i messaggi di testo validi
    let chatHistory = msgs
        .map(v => {
            let name = v.pushName || 'Utente';
            let content = v.message?.conversation || v.message?.extendedTextMessage?.text || '';
            return content ? `${name}: ${content}` : null;
        })
        .filter(v => v !== null)
        .join('\n');

    if (!chatHistory || msgs.length < 5) {
        throw `*⚠️ Messaggi insufficienti!* Ho bisogno di almeno 5-10 messaggi di testo recenti per creare un riassunto.`;
    }

    // 3. Messaggio di caricamento
    await conn.reply(chatId, '⏳ *Sto leggendo la conversazione...* Analizzo i punti salienti.', m);

    try {
        // 4. Generazione del riassunto tramite IA
        const prompt = `Sei un assistente per WhatsApp. Ti fornirò una lista di messaggi di una chat. 
        Il tuo compito è fare un riassunto breve (massimo 15 righe) in italiano. 
        Usa elenchi puntati, evidenzia i temi principali trattati e se qualcuno ha preso decisioni o appuntamenti. 
        Ecco la chat:\n\n${chatHistory}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const riassuntoTesto = response.text();

        // 5. Invio del risultato finale
        let finalTemplate = `📝 *RIASSUNTO CHAT RECENTE*\n\n${riassuntoTesto}\n\n_Generato automaticamente_`;
        
        await conn.reply(chatId, finalTemplate, m);

    } catch (e) {
        console.error(e);
        throw `*❌ Errore API:* Non è stato possibile generare il riassunto. Verifica la tua API Key.`;
    }
};

handler.help = ['riassunto'];
handler.tags = ['ai', 'utility'];
handler.command = /^(riassunto|recap)$/i;
handler.group = true; // Funziona meglio nei gruppi
handler.register = true;

export default handler;
