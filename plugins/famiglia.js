import { createCanvas, loadImage } from 'canvas'

global.db = global.db || {}
global.db.data = global.db.data || {}
global.db.data.users = global.db.data.users || {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = m.chat
    let user = m.sender
    let users = global.db.data.users

    const checkUser = (id) => {
        if (!id) return
        if (!users[id]) users[id] = {}
        if (!Array.isArray(users[id].p)) users[id].p = []
        if (users[id].c === undefined) users[id].c = null
        if (users[id].s === undefined) users[id].s = null
    }

    checkUser(user)

    // --- COMANDI GESTIONALI (Unione, Adotta, etc.) rimangono testuali ---
    if (command === 'famiglia') {
        let menu = `*🌳 SISTEMA GENEALOGICO REALE 🌳*\n\n`
        menu += `👉 *${usedPrefix}unione @tag* - Chiedi unione\n`
        menu += `👉 *${usedPrefix}adotta @tag* - Adotta un figlio\n`
        menu += `👉 *${usedPrefix}famigliamia* - Visualizza il tuo albero (IMG)\n`
        menu += `👉 *${usedPrefix}sciogli* - Divorzia\n`
        return m.reply(menu)
    }

    // --- LOGICA UNIONE E ADOTTA (Mantenuta dal tuo codice precedente) ---
    if (command === 'unione') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === user) return m.reply('*⚠️ Tagga qualcuno!*')
        checkUser(target)
        if (users[user].c) return m.reply('*⚠️ Sei già unito!*')
        users[target].propostaUnione = user
        return m.reply(`*💍 @${user.split('@')[0]} ha chiesto l'unione a @${target.split('@')[0]}!*\nScrivi *.accettaunione* per confermare.`, null, { mentions: [user, target] })
    }

    if (command === 'accettaunione') {
        let proponente = users[user].propostaUnione
        if (!proponente) return m.reply('*⚠️ Nessuna richiesta.*')
        users[user].c = proponente
        users[proponente].c = user
        delete users[user].propostaUnione
        return m.reply(`*✨ Unione confermata!*`)
    }

    if (command === 'adotta') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*⚠️ Chi vuoi adottare?*')
        checkUser(target)
        users[user].p.push(target)
        users[target].s = user
        return m.reply(`*👶 Hai adottato @${target.split('@')[0]}!*`, null, { mentions: [target] })
    }

    // --- GENERAZIONE IMMAGINE ALBERO ---
    if (command === 'famigliamia' || command === 'albero') {
        let target = (command === 'famigliamia') ? user : (m.mentionedJid[0] || (m.quoted ? m.quoted.sender : user))
        checkUser(target)

        await m.reply('⏳ *Generazione albero genealogico in corso...*')

        // Configurazione Canvas
        const canvas = createCanvas(800, 600)
        const ctx = canvas.getContext('2d')

        // Sfondo
        ctx.fillStyle = '#2c3e50' // Blu scuro elegante
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Titolo
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 30px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`ALBERO DI ${conn.getName(target).toUpperCase()}`, canvas.width / 2, 50)

        // Funzione per disegnare un "Box" parente
        const drawBox = async (id, x, y, label, color = '#ecf0f1') => {
            if (!id) return
            ctx.fillStyle = color
            ctx.fillRect(x - 80, y - 40, 160, 80)
            ctx.strokeStyle = '#f1c40f'
            ctx.lineWidth = 3
            ctx.strokeRect(x - 80, y - 40, 160, 80)
            
            ctx.fillStyle = '#2c3e50'
            ctx.font = 'bold 14px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(label, x, y - 15)
            ctx.font = '12px Arial'
            ctx.fillText(conn.getName(id).substring(0, 15), x, y + 15)
        }

        let u = users[target]
        let partner = u.c
        let padre = u.s
        
        // Disegno Linee di collegamento
        ctx.strokeStyle = '#bdc3c7'
        ctx.lineWidth = 2
        
        // Linea Padre -> Tu
        if (padre) {
            ctx.beginPath(); ctx.moveTo(400, 180); ctx.lineTo(400, 260); ctx.stroke()
            await drawBox(padre, 400, 140, '👨 PADRE', '#aed6f1')
        }

        // Tu e Partner
        if (partner) {
            ctx.beginPath(); ctx.moveTo(300, 300); ctx.lineTo(500, 300); ctx.stroke()
            await drawBox(target, 300, 300, '👤 TU', '#ffffff')
            await drawBox(partner, 500, 300, '💍 PARTNER', '#f1948a')
        } else {
            await drawBox(target, 400, 300, '👤 TU', '#ffffff')
        }

        // Figli (limitati a 3 per spazio immagine)
        if (u.p && u.p.length > 0) {
            ctx.beginPath(); ctx.moveTo(400, 340); ctx.lineTo(400, 420); ctx.stroke()
            let startX = 400 - (Math.min(u.p.length, 3) - 1) * 180 / 2
            for (let i = 0; i < Math.min(u.p.length, 3); i++) {
                let fx = startX + (i * 180)
                ctx.beginPath(); ctx.moveTo(400, 420); ctx.lineTo(fx, 460); ctx.stroke()
                await drawBox(u.p[i], fx, 500, '👶 FIGLIO', '#abebc6')
            }
        }

        const buffer = canvas.toBuffer()
        return conn.sendMessage(chat, { image: buffer, caption: `*🌳 Ecco l'albero genealogico di @${target.split('@')[0]}*`, mentions: [target] }, { quoted: m })
    }

    if (command === 'sciogli') {
        let ex = users[user].c
        if (!ex) return m.reply('*⚠️ Non sei unito a nessuno.*')
        users[user].c = null; if (users[ex]) users[ex].c = null
        return m.reply('*📄 Unione sciolta.*')
    }
}

handler.command = /^(unione|accettaunione|adotta|albero|famiglia|famigliamia|sciogli)$/i
handler.tags = ['giochi']
handler.group = true
export default handler
