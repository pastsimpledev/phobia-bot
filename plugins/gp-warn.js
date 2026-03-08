const handler = async (m, { conn, text, command, usedPrefix }) => {
    // 1. Identifichiamo l'utente (Menzione, Risposta o Numero nel testo)
    let who;
    if (m.mentionedJid[0]) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else if (text) {
        who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    }

    if (!who || who.length < 10) {
        return m.reply(`*⚠️ Esempio d'uso:*\n${usedPrefix + command} @utente\n${usedPrefix + command} 39351...`);
    }

    // 2. Pulizia ID (prendiamo solo i numeri: es. 3935165...)
    const cleanNumber = who.split('@')[0].replace(/[^0-9]/g, '');

    // 3. Controllo se è nel gruppo (Ricerca per numero puro)
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants;
    const member = participants.find(p => p.id.replace(/[^0-9]/g, '') === cleanNumber);

    if (!member) {
        return m.reply(`『 ❌ 』 *L'utente ${cleanNumber} non è in questo gruppo.*`);
    }

    // Usiamo l'ID REALE trovato nel gruppo per evitare errori di sistema
    const jid = member.id;

    // 4. Inizializzazione Database
    if (!global.db.data.users[jid]) global.db.data.users[jid] = { warn: 0 };
    let user = global.db.data.users[jid];

    // --- COMANDO WARN (AVVERTI) ---
    if (command === 'warn' || command === 'avverti') {
        if (jid === conn.user.jid) return m.reply('🤨 *Non puoi warnare il bot!*');
        
        user.warn = (user.warn || 0) + 1;
        let motivo = text ? text.replace(cleanNumber, '').replace(/@/g, '').trim() : 'Nessun motivo';

        if (user.warn >= 3) {
            user.warn = 0; // Reset
            await conn.sendMessage(m.chat, { text: `『 🚫 』 @${cleanNumber} *espulso: 3/3 avvertimenti.*`, mentions: [jid] }, { quoted: m });
            await conn.groupParticipantsUpdate(m.chat, [jid], 'remove');
        } else {
            await conn.sendMessage(m.chat, { text: `『 ⚠️ 』 *AVVERTIMENTO* @${cleanNumber}\n\n• *Motivo:* ${motivo}\n• *Warn:* ${user.warn}/3`, mentions: [jid] }, { quoted: m });
        }
    }

    // --- COMANDO UNWARN (TOGLI WARN) ---
    if (command === 'unwarn' || command === 'togliwarn') {
        if (!user.warn || user.warn <= 0) {
            return m.reply(`『 ✨ 』 @${cleanNumber} *non ha avvertimenti.*`, null, { mentions: [jid] });
        }
        
        user.warn -= 1;
        await conn.sendMessage(m.chat, { text: `『 ✅ 』 *Avvertimento rimosso a* @${cleanNumber}\n• *Totale:* ${user.warn}/3`, mentions: [jid] }, { quoted: m });
    }
};

handler.help = ['warn', 'unwarn'];
handler.tags = ['group'];
handler.command = /^(warn|avverti|unwarn|togliwarn)$/i;

handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
