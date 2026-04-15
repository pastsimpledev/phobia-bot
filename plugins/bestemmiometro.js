import { downloadContentFromMessage } from '@realvare/based'

let handler = m => m
handler.before = async function (m, { conn, isAdmin, isOwner }) {
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    if (!m.message) return true
    
    let chat = global.db.data.chats[m.chat]
    if (!chat || !chat.bestemmiometro) return true
    
    if (!chat.bestemmie) chat.bestemmie = { total: 0, users: {} }
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { bestemmie: 0 }
    let user = global.db.data.users[m.sender]

    let text = (m.message.conversation || 
               m.message.extendedTextMessage?.text || 
               m.message.imageMessage?.caption || 
               m.message.videoMessage?.caption || '').toLowerCase()

    // Regex Espansa: Include varianti blasfeme, accoppiamenti creativi e storpiature
    const regexBlasfema = /(porc[oa]\s*(?:dio|ges[uù]|cristo|madonna|madonina|spirito\s*santo|papa|dio)|di[oò]\s*(?:cane|porco|lurido|boia|maiale|schifoso|merda|stronzo|serpente|infame)|cristo\s*(?:cane|porco|boia|inchiodato|appeso)|madonna\s*(?:puttana|troia|maiala|serpe|schifosa|maledetta)|mannaggia\s*(?:a\s*dio|al\s*cristo|alla\s*madonna)|puttana\s*(?:la\s*madonna|la\s*chiesa)|dio\s*(?:impestato|scroto|merda|letame)|ges[uù]\s*(?:morto|marcio|appeso))/gi
    
    const matches = text.match(regexBlasfema)
    if (matches) {
        let count = matches.length
        user.bestemmie = (user.bestemmie || 0) + count
        chat.bestemmie.total += count
        chat.bestemmie.users[m.sender] = (chat.bestemmie.users[m.sender] || 0) + count

        // Gradi Infernali
        const getSinRank = (n) => {
            if (n > 500) return '🔥 LUCIFERO IN PERSONA'
            if (n > 200) return '👹 ARCIDEMONE'
            if (n > 100) return '🔱 ERETICO SUPREMO'
            if (n > 50) return '⛓️ ANIMA DANNATA'
            if (n > 20) return '👺 PECCATORE SERIALE'
            return '🤏 CHIERICHETTO'
        }

        const insulti = [
            "L'inferno ti aspetta a braccia aperte.",
            "Sento già l'odore di zolfo.",
            "Il prete del tuo quartiere ha appena avuto un brivido.",
            "Complimenti, un altro posto in paradiso cancellato.",
            "Continua così e diventerai il nuovo Papa nero."
        ]
        const randomInsult = insulti[Math.floor(Math.random() * insulti.length)]

        const tag = m.sender.split('@')[0]
        let res = `🔥 *ALLERTA BLASFEMIA* 🔥\n`
        res += `━━━━━━━━━━━━━━━\n`
        res += `👤 *Peccatore:* @${tag}\n`
        res += `🤬 *Bestemmie:* \`+${count}\`\n`
        res += `📈 *Peccati Totali:* \`${user.bestemmie}\`\n`
        res += `🏆 *Rango Infernale:* ${getSinRank(user.bestemmie)}\n`
        res += `━━━━━━━━━━━━━━━\n`
        res += `💬 _"${randomInsult}"_`

        await conn.reply(m.chat, res, m, { mentions: [m.sender] })
    }
    return true
}

handler.command = /^(bestemmie|classifica|inferno)$/i

handler.all = async function (m, { conn, command }) {
    if (!command) return
    let chat = global.db.data.chats[m.chat]
    if (!chat || !chat.bestemmiometro) return
    
    if (command === 'bestemmie' || command === 'classifica' || command === 'inferno') {
        let userStats = Object.entries(chat.bestemmie.users)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)

        if (userStats.length === 0) return m.reply('😇 Il gruppo è ancora puro. Nessun peccatore rilevato.')

        let leaderboard = `🩸 *GIRONI INFERNALI* 🩸\n`
        leaderboard += `_Classifica dei peggiori bestemmiatori_\n`
        leaderboard += `━━━━━━━━━━━━━━━\n\n`

        userStats.forEach(([user, count], i) => {
            let icon = i === 0 ? '👑' : i === 1 ? '🔱' : i === 2 ? '⚔️' : '💀'
            leaderboard += `${icon} *${i + 1}.* @${user.split('@')[0]} ➔ \`${count}\` Peccati\n`
        })

        leaderboard += `\n━━━━━━━━━━━━━━━\n`
        leaderboard += `🔥 *Olocausto Totale:* ${chat.bestemmie.total} bestemmie.`

        await conn.reply(m.chat, leaderboard, m, { mentions: userStats.map(x => x[0]) })
    }
}

export default handler
