// plug-in di blood - Fix Comando & Conteggio Totale
let handler = async (m, { conn }) => {
  let chatId = m.chat;
  let dati = global.db.data.chats[chatId]?.statsGiornaliere;

  if (!dati || dati.totali === 0) {
    return m.reply("📊 *STATISTICHE ATTUALI*\n\nNessun messaggio registrato oggi.");
  }

  let classifica = Object.entries(dati.utenti)
    .sort(([, a], [, b]) => b.conteggio - a.conteggio)
    .slice(0, 5);

  let report = `📊 *STATISTICHE IN TEMPO REALE* 📊\n`;
  report += `──────────────────\n\n`;
  report += `💬 Messaggi totali: *${dati.totali}*\n\n`;
  report += `🏆 *TOP PARLATORI:* \n`;

  const medaglie = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  classifica.forEach(([jid, u], i) => {
    report += `${medaglie[i]} *${u.nome}*: ${u.conteggio} messaggi\n`;
  });

  report += `\n──────────────────\n`;
  report += `👉 _Reset automatico a mezzanotte con premi!_`;

  await conn.sendMessage(chatId, { text: report }, { quoted: m });
};

// --- LOGICA DI CONTEGGIO (STICKER & SPAM) ---
handler.before = async function (m) {
  // 1. Filtri di sicurezza: No bot, solo gruppi
  if (!m.chat || m.isBaileys || !m.isGroup) return true; 

  // 2. Inizializzazione DB se vuoto
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  
  let oggi = new Date().toLocaleDateString('it-IT');
  
  if (!global.db.data.chats[m.chat].statsGiornaliere || global.db.data.chats[m.chat].statsGiornaliere.data !== oggi) {
    global.db.data.chats[m.chat].statsGiornaliere = { 
        totali: 0, 
        utenti: {}, 
        data: oggi 
    };
  }

  let stats = global.db.data.chats[m.chat].statsGiornaliere;

  // 3. Incremento: Conta testo, sticker, immagini, video, audio, etc.
  // Non mettiamo filtri su m.text così conta TUTTO lo spam
  stats.totali += 1;
  
  let nome = m.pushName || 'Utente';
  if (!stats.utenti[m.sender]) {
    stats.utenti[m.sender] = { nome: nome, conteggio: 0 };
  }
  stats.utenti[m.sender].conteggio += 1;
  
  return true; // FONDAMENTALE: Permette al bot di leggere anche i comandi!
};

// --- AUTOMAZIONE RESET MEZZANOTTE ---
// (Il resto del codice del timer rimane invariato, assicurati di averlo nel file)
// ... (codice setInterval) ...

handler.help = ['resoconto'];
handler.tags = ['strumenti'];
handler.command = /^(resoconto)$/i;
handler.group = true;

export default handler;
