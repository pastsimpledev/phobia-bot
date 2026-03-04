import { createCanvas, loadImage } from 'canvas'

// ... (tutte le configurazioni fruits e cavalliConfig viste sopra) ...

let handler = async (m, { conn, command, args, usedPrefix }) => {
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    let user = global.db.data.users[m.sender]
    if (user.fiches === undefined) user.fiches = 1000
    
    // --- 1. MENU PRINCIPALE ---
    if (command === 'casino') {
        let intro = `*🎰 BENVENUTO NEL CASINÒ 🎰*\n\n*💰 SALDO:* *${user.fiches} FICHES*`
        const buttons = [
            { buttonId: `${usedPrefix}infoslot`, buttonText: { displayText: '🎰 SLOT MACHINE' }, type: 1 },
            { buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 BLACKJACK' }, type: 1 },
            { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA CAVALLI' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: intro, buttons }, { quoted: m })
    }

    // --- 2. GESTIONE INFO (I PULSANTI DEL MENU PORTANO QUI) ---
    if (command === 'infoslot') {
        let desc = `*🎰 SLOT MACHINE*\n\nTenta la fortuna con i frutti!`
        const buttons = [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 GIOCA ORA' }, type: 1 }]
        return conn.sendMessage(m.chat, { text: desc, buttons }, { quoted: m })
    }

    if (command === 'infobj') {
        let desc = `*🃏 BLACKJACK*\n\nBatti il banco senza superare 21!`
        const buttons = [{ buttonId: `${usedPrefix}blakjak 100`, buttonText: { displayText: '🃏 GIOCA ORA' }, type: 1 }]
        return conn.sendMessage(m.chat, { text: desc, buttons }, { quoted: m })
    }

    if (command === 'infocorsa') {
        let desc = `*🏇 CORSA CAVALLI*\n\nScegli il colore del tuo campione!`
        const buttons = [
            { buttonId: `${usedPrefix}puntacorsa ROSSO`, buttonText: { displayText: '🔴 ROSSO' }, type: 1 },
            { buttonId: `${usedPrefix}puntacorsa BLU`, buttonText: { displayText: '🔵 BLU' }, type: 1 },
            { buttonId: `${usedPrefix}puntacorsa VERDE`, buttonText: { displayText: '🟢 VERDE' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: desc, buttons }, { quoted: m })
    }

    // --- 3. LOGICHE GIOCHI (I PULSANTI DELLE INFO PORTANO QUI) ---
    if (command === 'slot') {
        // ... (logica slot: r1, r2, r3, ecc.) ...
        // RICORDA: Il bottone rigioca deve essere: { buttonId: `${usedPrefix}slot`, ... }
    }

    if (command === 'blakjak' || command === 'blackjack') {
        // ... (logica blackjack) ...
        // RICORDA: Il bottone rigioca deve essere: { buttonId: `${usedPrefix}infobj`, ... }
    }

    if (command === 'puntacorsa') {
        // ... (logica corsa) ...
        // RICORDA: Il bottone rigioca deve essere: { buttonId: `${usedPrefix}infocorsa`, ... }
    }
}

// --- QUESTA SEZIONE È FONDAMENTALE PER FAR FUNZIONARE I TASTI ---
handler.help = ['casino']
handler.tags = ['giochi']
// Assicurati che TUTTI i comandi usati nei buttonId siano scritti qui sotto:
handler.command = /^(casino|infoslot|slot|infobj|blakjak|blackjack|infocorsa|puntacorsa)$/i
handler.group = true

export default handler
