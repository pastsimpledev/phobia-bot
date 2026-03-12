// plug-in di blood - Gestione Moderatori (Finti Admin)
let handler = async (m, { conn, text, command, usedPrefix, isOwner }) => {
    // Controllo permessi: solo l'Owner/Creatore può gestire i moderatori
    if (!isOwner) return m.reply("❌ Questo comando è riservato al proprietario del bot.")

    let chatId = m.chat
    // Inizializza la struttura nel database se non esiste
    if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}
    if (!global.db.data.chats[chatId].moderatori) global.db.data.chats[chatId].moderatori = []

    let mods = global.db.data.chats[chatId].moderatori

    // --- COMANDO .ADDMOD ---
    if (command === 'addmod') {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null
        
        if (!who) return m.reply(`Tagga qualcuno o rispondi a un messaggio per aggiungerlo come moderatore.`)
        if (mods.includes(who)) return m.reply("⚠️ Questo utente è già un moderatore.")

        mods.push(who)
        return m.reply(`✅ @${who.split('@')[0]} è stato aggiunto!\nOra il bot lo tratterà come un Admin del gruppo.`, null, { mentions: [who] })
    }

    // --- COMANDO .DELMOD ---
    if (command === 'delmod') {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null
        
        if (!who) return m.reply(`Tagga qualcuno o rispondi a un messaggio per rimuoverlo.`)
        if (!mods.includes(who)) return m.reply("⚠️ Questo utente non è nella lista moderatori.")

        global.db.data.chats[chatId].moderatori = mods.filter(jid => jid !== who)
        return m.reply(`🗑️ Privilegi rimossi per @${who.split('@')[0]}.`, null, { mentions: [who] })
    }

    // --- COMANDO .LISTANERA (Mostra i mod) ---
    if (command === 'listanera') {
        if (mods.length === 0) return m.reply("📋 Non ci sono moderatori registrati in questo gruppo.")

        let lista = `📋 *LISTA MODERATORI (ADMIN BOT)*\n`
        lista += `──────────────────\n\n`
        mods.forEach((jid, i) => {
            lista += `${i + 1}. @${jid.split('@')[0]}\n`
        })
        lista += `\n──────────────────\n_Questi utenti possono usare i comandi admin._`

        return conn.sendMessage(chatId, { text: lista, mentions: mods }, { quoted: m })
    }
}

// Questa funzione "inganna" il sistema di permessi globale
handler.before = async function (m) {
    if (!m.isGroup || !global.db.data.chats[m.chat]?.moderatori) return
    
    let mods = global.db.data.chats[m.chat].moderatori
    
    // Se l'utente che scrive è nella lista mod, forziamo il flag isAdmin
    if (mods.includes(m.sender)) {
        m.isAdmin = true 
    }
}

handler.help = ['addmod', 'delmod', 'listanera']
handler.tags = ['owner', 'group']
handler.command = /^(addmod|delmod|listanera)$/i
handler.group = true

export default handler
