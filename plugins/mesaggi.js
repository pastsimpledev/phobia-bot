import { createCanvas } from 'canvas'

const footer = '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'

// Soglie Obiettivi e Ricompense
const rewards = [
    { limit: 100, premio: 500, titolo: "PRINCIPIANTE 🐣", commento: "Ha appena iniziato a spammare forte!" },
    { limit: 500, premio: 1500, titolo: "CHIACCHIERONE 🗣️", commento: "Non sta mai zitto, vero?" },
    { limit: 1000, premio: 5000, titolo: "NERD 🤓", commento: "Ha ufficialmente perso il contatto con la realtà." },
    { limit: 5000, premio: 15000, titolo: "VETERANO 🎖️", commento: "Le sue dita sono diventate d'acciaio." },
    { limit: 10000, premio: 50000, titolo: "LEGGENDA 👑", commento: "Il re assoluto della chat!" }
]

let handler = async (m, { conn, command }) => {
    let who = m.sender
    global.db.data.users[who] = global.db.data.users[who] || {}
    let user = global.db.data.users[who]

    // --- COMANDO CLASSIFICA (.topmsgs) ---
    if (command === 'topmsgs' || command === 'classifica') {
        let users = Object.entries(global.db.data.users)
            .map(([id, data]) => ({ id, msgs: data.msgs || 0 }))
            .filter(u => u.msgs > 0)
            .sort((a, b) => b.msgs - a.msgs)
            .slice(0, 10)

        if (users.length === 0) return m.reply("📭 Nessun dato ancora registrato per questo mese.")

        let top = `ㅤ⋆｡˚『 ╭ \`🏆 TOP 10 ATTIVITÀ MESE \` ╯ 』˚｡⋆\n╭\n`
        users.forEach((u, i) => {
            top += `│ ${i + 1}º | @${u.id.split('@')[0]} : *${u.msgs}* msg\n`
        })
        top += `│ ──────────────────\n`
        top += `│ 📅 Reset tra: ${getDaysUntilNextMonth()} giorni\n`
        top += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
        return conn.sendMessage(m.chat, { text: top, mentions: users.map(u => u.id) }, { quoted: m })
    }

    // --- COMANDO STATS (.messaggi) ---
    let msgs = user.msgs || 0
    let next = rewards.find(r => r.limit > msgs) || { limit: 'MAX', titolo: 'DIO' }
    
    let stats = `ㅤ⋆｡˚『 ╭ \`📊 I TUOI MESSAGGI \` ╯ 』˚｡⋆\n╭\n`
    stats += `│ 『 👤 』 @${who.split('@')[0]}\n`
    stats += `│ 『 📈 』 \`Contatore Attivo:\` *${msgs}*\n`
    stats += `│ 『 🏆 』 \`Prossima Soglia:\` *${next.limit}*\n`
    stats += `│ ──────────────────\n`
    stats += `│ 📅 \`Reset Mensile:\` Fine mese\n`
    stats += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

    const buttons = [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🏆 VEDI CLASSIFICA', id: `.topmsgs` }) }
    ]
    return conn.sendMessage(m.chat, { text: stats, footer, mentions: [who], interactiveButtons: buttons }, { quoted: m })
}

// --- QUESTA PARTE GIRA SEMPRE: CONTA OGNI MESSAGGIO ---
handler.before = async function (m, { conn }) {
    // Escludiamo messaggi dal bot stesso o fuori dai gruppi
    if (!m.isGroup || m.fromMe || !m.sender) return
    
    // Assicuriamoci che l'utente esista nel database
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    let user = global.db.data.users[m.sender]
    
    // --- GESTIONE RESET MENSILE AUTOMATICO ---
    let date = new Date()
    let currentMonth = date.getMonth()
    global.db.data.settings = global.db.data.settings || {}
    if (global.db.data.settings.lastResetMonth === undefined) global.db.data.settings.lastResetMonth = currentMonth

    if (global.db.data.settings.lastResetMonth !== currentMonth) {
        Object.keys(global.db.data.users).forEach(id => {
            global.db.data.users[id].msgs = 0 // Reset messaggi
            if (global.db.data.users[id].achievements) {
                global.db.data.users[id].achievements = global.db.data.users[id].achievements.filter(a => !a.startsWith('MSG_'))
            }
        })
        global.db.data.settings.lastResetMonth = currentMonth
        conn.reply(m.chat, '📅 *SISTEMA:* È iniziato un nuovo mese. Tutti i contatori messaggi sono stati resettati a zero!', null)
    }

    // INCREMENTO IMMEDIATO: Conta qualsiasi cosa scriva l'utente
    user.msgs = (user.msgs || 0) + 1
    user.achievements = user.achievements || []

    // Controllo se ha sbloccato un premio in questo istante
    let currentReward = rewards.find(r => user.msgs === r.limit)

    if (currentReward && !user.achievements.includes('MSG_' + currentReward.limit)) {
        user.euro = (user.euro || 0) + currentReward.premio
        user.achievements.push('MSG_' + currentReward.limit)

        const canvas = createCanvas(600, 300)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 600, 300)
        ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 10; ctx.strokeRect(10, 10, 580, 280)
        ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'
        ctx.fillText(currentReward.titolo, 300, 100)
        ctx.fillStyle = '#ffffff'; ctx.font = '30px Arial'
        ctx.fillText(`${user.msgs} MESSAGGI INVIATI`, 300, 180)
        ctx.fillStyle = '#ffcc00'; ctx.fillText(`PREMIO: +${currentReward.premio}€`, 300, 250)

        await conn.sendMessage(m.chat, { 
            image: canvas.toBuffer(), 
            caption: `🏆 Complimenti @${m.sender.split('@')[0]}! Hai raggiunto il grado *${currentReward.titolo}*!`, 
            mentions: [m.sender] 
        }, { quoted: m })
    }
}

function getDaysUntilNextMonth() {
    let now = new Date()
    let nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return Math.ceil((nextMonth - now) / (1000 * 60 * 60 * 24))
}

handler.help = ['messaggi', 'topmsgs']
handler.tags = ['giochi']
handler.command = /^(messaggi|msgs|stats|topmsgs|classifica)$/i
handler.group = true

export default handler
