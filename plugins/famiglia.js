global.db = global.db || {}
global.db.data = global.db.data || {}
global.db.data.users = global.db.data.users || {}

let handler = async (m, { conn, text, command }) => {
    let chat = m.chat
    let user = m.sender
    let users = global.db.data.users

    const checkUser = (id) => {
        if (!users[id]) users[id] = {}
        if (!Array.isArray(users[id].p)) users[id].p = []
        if (users[id].c === undefined) users[id].c = null
        if (users[id].s === undefined) users[id].s = null
    }

    checkUser(user)

    if (command === 'unione') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*Menziona qualcuno per l\'unione!*')
        checkUser(target)
        if (users[user].c) return m.reply('*Sei già unito!*')
        users[user].proposta = target
        return conn.sendMessage(chat, { text: `*💍 @${user.split('@')[0]} chiede l'unione a @${target.split('@')[0]}*\n\nAccetti? Usa i bottoni o scrivi .accettaunione`, mentions: [user, target] })
    }

    if (command === 'adotta') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*Chi vuoi adottare?*')
        checkUser(target)
        if (users[target].s) return m.reply('*Ha già un genitore!*')
        users[user].p.push(target)
        users[target].s = user
        return m.reply(`*👶 Adottato con successo!*`)
    }

    if (command === 'albero' || command === 'famigliamia' || command === 'famiglia') {
        let target = (command === 'famigliamia') ? user : (m.mentionedJid[0] || (m.quoted ? m.quoted.sender : user))
        checkUser(target)
        
        let u = users[target]
        let gen = u.s
        let nonno = (gen && users[gen]) ? users[gen].s : null
        let partner = u.c

        let fmt = (id) => id ? `@${id.split('@')[0]}` : '???'
        
        // COSTRUZIONE GRAFICA DELL'ALBERO
        let tree = `*🌳 ALBERO GENEALOGICO DI ${fmt(target).toUpperCase()} 🌳*\n\n`
        
        // Generazione Nonni
        tree += `      [👴 ${fmt(nonno)}]\n`
        tree += `             ┃\n`
        
        // Generazione Genitori
        tree += `      [👨 ${fmt(gen)}]\n`
        tree += `             ┃\n`
        
        // Utente e Partner
        if (partner) {
            tree += `  [👤 ${fmt(target)}] ═══ [💍 ${fmt(partner)}]\n`
        } else {
            tree += `      [👤 ${fmt(target)}]\n`
        }
        
        // Generazione Figli
        if (u.p && u.p.length > 0) {
            tree += `             ┣━━━━━━━━┓\n`
            u.p.forEach((figlio, i) => {
                let rano = (i === u.p.length - 1) ? '┗' : '┣'
                tree += `             ${rano}━ [👶 ${fmt(figlio)}]\n`
                
                // Generazione Nipoti (Figli dei figli)
                if (users[figlio] && users[figlio].p && users[figlio].p.length > 0) {
                    users[figlio].p.forEach((nipote, ni) => {
                        let subRano = (ni === users[figlio].p.length - 1) ? ' ' : '┃'
                        let subRano2 = (ni === users[figlio].p.length - 1) ? '┗' : '┣'
                        tree += `             ${subRano}      ${subRano2}━ [🍼 ${fmt(nipote)}]\n`
                    })
                }
            })
        } else {
            tree += `             ┃\n`
            tree += `      (Nessun figlio)\n`
        }

        tree += `\n──────────────────────\n`
        tree += `_Usa .famiglia per la guida comandi_`

        let mnts = [target, partner, gen, nonno, ...(u.p || [])].filter(Boolean)
        // Aggiungiamo anche i nipoti alle menzioni per evitare @id grezzi
        u.p.forEach(f => { if(users[f]?.p) mnts.push(...users[f].p) })

        return conn.sendMessage(chat, { text: tree, mentions: [...new Set(mnts)] }, { quoted: m })
    }

    if (command === 'sciogli') {
        let ex = users[user].c
        if (!ex) return m.reply('*Sei solo come un sasso.*')
        users[user].c = null; if (users[ex]) users[ex].c = null
        return m.reply('*Unione sciolta!*')
    }
}

handler.command = /^(unione|accettaunione|adotta|albero|famiglia|famigliamia|sciogli)$/i
handler.group = true
export default handler
