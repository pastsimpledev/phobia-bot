// plug-in di blood - Versione Ottimizzata (Spam & Sticker Ready)
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
  report += `👉 _Reset automatico a mezzanotte con premi in denaro!_`;

  await conn.sendMessage(chatId, { text: report }, { quoted: m });
};

// --- REGISTRAZIONE MESSAGGI (OTTIMIZZATA PER SPAM E STICKER) ---
handler.before = async function (m) {
  // Rimosso il controllo m.text per contare sticker, immagini e file
  if (!m.chat || m.isBaileys || !m.isGroup) return; 

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  
  let oggi = new Date().toLocaleDateString('it-IT');
  
  // Inizializzazione se non esiste o se è un nuovo giorno
  if (!global.db.data.chats[m.chat].statsGiornaliere || global.db.data.chats[m.chat].statsGiornaliere.data !== oggi) {
    global.db.data.chats[m.chat].statsGiornaliere = { 
        totali: 0, 
        utenti: {}, 
        data: oggi 
    };
  }

  let stats = global.db.data.chats[m.chat].statsGiornaliere;

  // Conta tutto: messaggi di testo, sticker, media, etc.
  stats.totali += 1;
  
  let nome = m.pushName || 'Utente';
  if (!stats.utenti[m.sender]) {
    stats.utenti[m.sender] = { nome: nome, conteggio: 0 };
  }
  stats.utenti[m.sender].conteggio += 1;
  
  return true; // Importante per non bloccare altri plugin
};

// --- AUTOMAZIONE MEZZANOTTE ---
let isResetting = false; 
setInterval(async () => {
    let d = new Date();
    let ora = d.getHours();
    let minuti = d.getMinutes();

    if (ora === 0 && minuti === 0 && !isResetting) {
        isResetting = true; 
        let chats = global.db.data.chats;

        for (let gid in chats) {
            let dati = chats[gid]?.statsGiornaliere;
            if (!dati || dati.totali === 0) continue;

            let classifica = Object.entries(dati.utenti)
                .sort(([, a], [, b]) => b.conteggio - a.conteggio)
                .slice(0, 3);

            if (classifica.length === 0) continue;

            let reportFinal = `🌙 *RESOCONTO FINALE DELLA GIORNATA* 🌙\n`;
            reportFinal += `──────────────────\n\n`;
            reportFinal += `📊 Totale messaggi: *${dati.totali}*\n\n`;
            reportFinal += `🏆 *PODIO E PREMI:* \n`;

            const medaglie = ['🥇', '🥈', '🥉'];
            const premi = [2000, 100, 500]; 
            let mentions = [];

            classifica.forEach(([jid, u], i) => {
                let premio = premi[i] || 0;
                mentions.push(jid);

                if (!global.db.data.users[jid]) global.db.data.users[jid] = { money: 0 };
                global.db.data.users[jid].money += premio;

                reportFinal += `${medaglie[i]} @${jid.split('@')[0]}\n`;
                reportFinal += `   └─ 💬 ${u.conteggio} messaggi | 💰 +$${premio}\n\n`;
            });

            reportFinal += `──────────────────\n`;
            reportFinal += `✨ *Premi accreditati. Il database è stato resettato!*`;

            try {
                await global.conn.sendMessage(gid, { text: reportFinal, mentions: mentions });
            } catch (e) { console.error(e) }

            // Reset dopo l'invio
            chats[gid].statsGiornaliere = { 
                totali: 0, 
                utenti: {}, 
                data: new Date().toLocaleDateString('it-IT') 
            };
        }
    } else if (minuti !== 0) {
        isResetting = false; 
    }
}, 30000); 

handler.help = ['resoconto'];
handler.tags = ['strumenti'];
handler.command = /^(resoconto)$/i;
handler.group = true;

export default handler;
