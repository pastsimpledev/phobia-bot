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
    // Gestione comando manuale per statistiche
    let who = m.sender
    global.db.data.users[who] = global.db.data.users[who] || {}
    let user = global.db.data.users[who]
    
    let msgs = user.msgs || 0
    let next = rewards.find(r => r.limit > msgs) || { limit: 'MAX', titolo: 'DIO DELLA CHAT' }

    let stats = `ㅤ⋆｡˚『 ╭ \`📊 STATISTICHE ATTIVITÀ \` ╯ 』˚｡⋆\n╭\n`
    stats += `│ 『 👤 』 @${who.split('@')[0]}\n`
    stats += `│ 『 📈 』 \`Messaggi Mensili:\` *${msgs}*\n`
    stats += `│ 『 🏆 』 \`Prossimo Grado:\` *${next.limit} msgs*\n`
    stats += `│ ──────────────────\n`
    stats += `│ 📅 \`Reset tra:\` ${getDaysUntilNextMonth()} giorni\n`
    stats += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

    return conn.sendMessage(m.chat, { text: stats, mentions: [who], footer }, { quoted: m })
}

handler.before = async function (m, { conn }) {
    if (!m.isGroup || m.fromMe || !m.sender) return
    
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    let user = global.db.data.users[m.sender]
    
    // --- SISTEMA RESET MENSILE ---
    let date = new Date()
    let currentMonth = date.getMonth() // 0-11
    global.db.data.settings = global.db.data.settings || {}
    if (global.db.data.settings.lastResetMonth === undefined) global.db.data.settings.lastResetMonth = currentMonth

    if (global.db.data.settings.lastResetMonth !== currentMonth) {
        // È iniziato un nuovo mese! Reset globale
        Object.keys(global.db.data.users).forEach(id => {
            global.db.data.users[id].msgs = 0
            global.db.data.users[id].achievements = global.db.data.users[id].achievements || []
            // Rimuoviamo solo gli obiettivi legati ai messaggi per farli rifare
            global.db.data.users[id].achievements = global.db.data.users[id].achievements.filter(a => !a.startsWith('MSG_'))
        })
        global.db.data.settings.lastResetMonth = currentMonth
        conn.reply(m.chat, '📅 *NUOVO MESE INIZIATO!*\nI contatori messaggi sono stati resettati. Buona scalata a tutti! 🚀', null)
    }

    // Incremento contatore
    user.msgs = (user.msgs || 0) + 1
    user.achievements = user.achievements || []

    // Controllo se ha raggiunto una soglia premio
    let currentReward = rewards.find(r => user.msgs === r.limit)

    if (currentReward && !user.achievements.includes('MSG_' + currentReward.limit)) {
        user.euro = (user.euro || 0) + currentReward.premio
        user.achievements.push('MSG_' + currentReward.limit)

        const canvas = createCanvas(600, 350)
        const ctx = canvas.getContext('2d')

        // Sfondo hi-tech
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 600, 350)
        ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 8; ctx.strokeRect(20, 20, 560, 310)

        // Testo Titolo
        ctx.fillStyle = '#00ffff'; ctx.font = 'bold 45px Arial'; ctx.textAlign = 'center'
        ctx.fillText(currentReward.titolo, 300, 100)

        // Barra di caricamento piena
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(100, 150, 400, 30)
        ctx.fillStyle = '#00ffff'; ctx.fillRect(100, 150, 400, 30)

        // Ricompensa
        ctx.fillStyle = '#ffffff'; ctx.font = '30px Arial'
        ctx.fillText(`${user.msgs} MESSAGGI COMPLETATI`, 300, 230)
        ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 35px Arial'
        ctx.fillText(`+${currentReward.premio}€`, 300, 290)

        let cap = `ㅤ⋆｡˚『 ╭ \`🏆 TRAGUARDO SBLOCCATO \` ╯ 』˚｡⋆\n╭\n`
        cap += `│ 『 👤 』 @${m.sender.split('@')[0]}\n`
        cap += `│ 『 📈 』 \`Messaggi:\` *${user.msgs}*\n`
        cap += `│ 『 🏆 』 \`Nuovo Grado:\` *${currentReward.titolo}*\n`
        cap += `│ ──────────────────\n`
        cap += `│ 『 💬 』 _${currentReward.commento}_\n`
        cap += `│ 『 🎁 』 \`Bonus Accreditato:\` *+${currentReward.premio} Euro*\n`
        cap += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        await conn.sendMessage(m.chat, { 
            image: canvas.toBuffer(), 
            caption: cap, 
            footer, 
            mentions: [m.sender] 
        }, { quoted: m })
    }
}

function getDaysUntilNextMonth() {
    let now = new Date()
    let nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    let diff = nextMonth - now
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

handler.help = ['messaggi']
handler.tags = ['giochi']
handler.command = /^(messaggi|msgs|stats|obiettivi)$/i
handler.group = true

export default handler
