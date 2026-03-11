const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: 'Nuova sfida! 🧠', id: `.math` })
}];

let handler = async (m, { conn, isAdmin, isBotAdmin, usedPrefix, command }) => {
    if (command === 'skipmath') {
        if (!m.isGroup) return m.reply('⚠️ Solo nei gruppi!');
        if (!global.mathGame?.[m.chat]) return m.reply('⚠️ Nessuna operazione attiva!');
        if (!isAdmin && !m.fromMe) return m.reply('❌ Solo admin!');
        clearTimeout(global.mathGame[m.chat].timeout);
        delete global.mathGame[m.chat];
        return m.reply('✅ Sfida annullata.');
    }

    if (global.mathGame?.[m.chat]) return m.reply('⚠️ C\'è già una sfida attiva!');

    // Cooldown
    const cooldownKey = `math_${m.chat}`;
    const now = Date.now();
    if (now - (global.cooldowns?.[cooldownKey] || 0) < 5000) return;
    global.cooldowns = { ...global.cooldowns, [cooldownKey]: now };

    // --- LOGICA DI GENERAZIONE DINAMICA ---
    let n1, n2, op, risposta, difficolta;
    const tipoSfida = Math.random();

    if (tipoSfida < 0.4) { // 40% Facile: Addizione/Sottrazione
        difficolta = "FACILE";
        op = Math.random() > 0.5 ? '+' : '-';
        n1 = Math.floor(Math.random() * 200) + 10;
        n2 = Math.floor(Math.random() * 200) + 10;
        risposta = eval(`${n1} ${op} ${n2}`);
    } else if (tipoSfida < 0.7) { // 30% Medio: Moltiplicazione
        difficolta = "MEDIO";
        op = '×';
        n1 = Math.floor(Math.random() * 20) + 2;
        n2 = Math.floor(Math.random() * 12) + 2;
        risposta = n1 * n2;
    } else if (tipoSfida < 0.9) { // 20% Difficile: Tre numeri
        difficolta = "DIFFICILE";
        const ops = ['+', '-'];
        op = `${ops[Math.floor(Math.random() * 2)]} ${ops[Math.floor(Math.random() * 2)]}`;
        n1 = Math.floor(Math.random() * 100);
        n2 = Math.floor(Math.random() * 50);
        let n3 = Math.floor(Math.random() * 30);
        let expr = `${n1} ${op.split(' ')[0]} ${n2} ${op.split(' ')[1]} ${n3}`;
        op = expr.replace(/\+/g, '+').replace(/-/g, '-');
        risposta = eval(expr);
    } else { // 10% Leggendario: Potenze semplici
        difficolta = "LEGGENDARIO";
        n1 = Math.floor(Math.random() * 10) + 2;
        n2 = Math.random() > 0.5 ? 2 : 3; // Solo quadrati o cubi
        op = `^${n2}`;
        risposta = Math.pow(n1, n2);
    }

    let reward = difficolta === "FACILE" ? 20 : difficolta === "MEDIO" ? 40 : difficolta === "DIFFICILE" ? 70 : 120;

    let caption = `ㅤ⋆｡˚『 ╭ \`MATH QUIZ: ${difficolta}\` ╯ 』˚｡⋆\n╭\n`;
    caption += `│ 『 🧠 』 \`Risolvi:\` *${difficolta === "LEGGENDARIO" ? n1 + op : n1 + ' ' + op + ' ' + (n2 || '')}*\n`;
    caption += `│ 『 ⏱️ 』 \`Tempo:\` *20 secondi*\n`;
    caption += `│ 『 💰 』 \`Premio stimato:\` *${reward}€*\n`;
    caption += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    let msg = await conn.sendMessage(m.chat, { text: caption, footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙' }, { quoted: m });

    global.mathGame = global.mathGame || {};
    global.mathGame[m.chat] = {
        id: msg.key.id,
        risposta: risposta.toString(),
        premioBase: reward,
        startTime: Date.now(),
        timeout: setTimeout(async () => {
            if (global.mathGame?.[m.chat]) {
                await conn.sendMessage(m.chat, { 
                    text: `*TEMPO SCADUTO!* ⏰\nLa risposta era: *${risposta}*`,
                    interactiveButtons: playAgainButtons()
                }, { quoted: msg });
                delete global.mathGame[m.chat];
            }
        }, 20000)
    };
};

handler.before = async (m, { conn }) => {
    const game = global.mathGame?.[m.chat];
    if (!game || m.key.fromMe || isNaN(m.text)) return;

    if (m.text.trim() === game.risposta) {
        clearTimeout(game.timeout);
        const timeTaken = Math.round((Date.now() - game.startTime) / 1000);
        let finalReward = game.premioBase + (timeTaken <= 5 ? 20 : 0);

        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + finalReward;
        global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + 150;

        let winText = `ㅤ⋆｡˚『 ╭ \`RISULTATO ESATTO!\` ╯ 』˚｡⋆\n╭\n`;
        winText += `│ 『 ✅ 』 \`Risposta:\` *${game.risposta}*\n`;
        winText += `│ 『 💰 』 \`Guadagno:\` *${finalReward}€*\n`;
        winText += `│ 『 🆙 』 *+150 EXP*\n`;
        winText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

        await conn.sendMessage(m.chat, { text: winText, footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙', interactiveButtons: playAgainButtons() }, { quoted: m });
        delete global.mathGame[m.chat];
    }
};

handler.help = ['math'];
handler.tags = ['giochi'];
handler.command = /^(math|matematica|skipmath)$/i;
handler.group = true;
handler.register = true;

export default handler;
