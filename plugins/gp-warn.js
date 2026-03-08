const handler = async (m, { conn, text, command, usedPrefix }) => {
    // Inizializzazione database se mancante
    if (!global.db.data.users) global.db.data.users = {}

    let who;
    if (m.isGroup) {
        who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;
    } else {
        who = m.chat;
    }

    if (!who) return m.reply(`*『 📋 』 METODI DISPONIBILI:*\n\n• *${usedPrefix + command} @utente*\n• *Rispondi a un messaggio*\n• *${usedPrefix + command} 39351...*`);

    // Pulizia ID per confronto sicuro
    const targetNumber = who.split('@')[0].replace(/[^0-9]/g, '');
    
    // Controllo se l'utente è nel gruppo (Logica Anti-Errore)
    const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {};
    const participants = groupMetadata.participants || [];
    const member = participants.find(p => p.id.replace(/[^0-9]/g, '') === targetNumber);

    if (m.isGroup && !member) {
        return m.reply(`『 ❌ 』 *L'utente ${targetNumber} non è in questo gruppo.*`);
    }

    const realJid = member ? member.id : who;
    const user = global.db.data.users[realJid];
    
    // Inizializza i warn per la chat specifica
    if (!user) global.db.data.users[realJid] = { warn: 0 };
    if (!user.warn) user.warn = 0;

    // --- LOGICA COMANDO WARN ---
    if (command === 'warn' || command === 'avverti') {
        if (realJid === conn.user.jid) return m.reply('🤨 *Perché vorresti warnare me?*');
        if (global.owner.some(owner => owner[0] === targetNumber)) return m.reply('🤫 *Non puoi warnare il mio creatore.*');

        user.warn += 1;
        const motivo = text ? text.replace(targetNumber, '').replace(/@/g, '').trim() : 'Nessun motivo specificato';

        if (user.warn >= 3) {
            user.warn = 0; // Reset per sicurezza se rientra
            await m.reply(`『 🚫 』 @${targetNumber} *ha raggiunto 3/3 warn ed è stato rimosso.*`, null, { mentions: [realJid] });
            await conn.groupParticipantsUpdate(m.chat, [realJid], 'remove');
        } else {
            await m.reply(`『 ⚠️ 』 *AVVERTIMENTO* @${targetNumber}\n\n• *Motivo:* ${motivo}\n• *Warn:* ${user.warn}/3`, null, { mentions: [realJid] });
        }
    }

    // --- LOGICA COMANDO UNWARN ---
    if (command === 'unwarn' || command === 'togliwarn') {
        if (user.warn <= 0) return m.reply(`『 ✨ 』 @${targetNumber} *non ha alcun avvertimento.*`, null, { mentions: [realJid] });

        user.warn -= 1;
        await m.reply(`『 ✅ 』 *AVVERTIMENTO RIMOSSO* @${targetNumber}\n\n• *Warn rimanenti:* ${user.warn}/3`, null, { mentions: [realJid] });
    }
};

handler.help = ['warn @utente', 'unwarn @utente'];
handler.tags = ['group'];
handler.command = ['warn', 'avverti', 'unwarn', 'togliwarn'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
