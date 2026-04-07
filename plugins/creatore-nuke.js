let handler = async (m, { conn, text, command }) => {
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    let getGroups = await conn.groupFetchAllParticipating();
    let groups = Object.values(getGroups);
    let targetChat;

    if (!m.isGroup) {
        if (!text) {
            let txt = "🩸 *Scegli il gruppo da devastare:*\n\n";
            groups.forEach((g, i) => { txt += `*${i + 1}.* ${g.subject}\n`; });
            txt += `\n👉 Scrivi *.${command} [numero]*`;
            return m.reply(txt);
        }
        let index = parseInt(text) - 1;
        if (isNaN(index) || !groups[index]) return m.reply("❌ Numero non valido.");
        targetChat = groups[index].id;
    } else {
        targetChat = m.chat;
    }

    try {
        const botId = conn.user.id.includes(':') ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : conn.user.id;
        
        // Forziamo il recupero dei dati più recenti
        let metadata = await conn.groupMetadata(targetChat, true).catch(_ => conn.groupMetadata(targetChat));
        if (!metadata) return m.reply("❌ Errore critico nel recupero dati gruppo.");

        // 1. Cambio Nome
        await conn.groupUpdateSubject(targetChat, `${metadata.subject} | 𝚂𝚅𝚃 𝙱𝚢 𝐁𝐋𝐎𝐎𝐃`).catch(() => {});

        // 2. Messaggi
        await conn.sendMessage(targetChat, {
            text: "𝐁𝐥𝐨𝐨𝐝 𝐞̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨 𝐢𝐧 𝐜𝐢𝐫𝐜𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞, 𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐬𝐢𝐠𝐧𝐢𝐟𝐢𝐜𝐚 𝐬𝐨𝐥𝐨 𝐮𝐧𝐚 𝐜𝐨𝐬𝐚, 𝐃𝐄𝐕𝐀𝐒𝐓𝐎. 𝐈𝐥 𝐝𝐞𝐯𝐚𝐬𝐭𝐨 𝐜𝐡𝐞 𝐚𝐦𝐦𝐚𝐳𝐳𝐞𝐫𝐚̀ 𝐭𝐮𝐭𝐭𝐢 𝐩𝐫𝐨𝐩𝐫𝐢𝐨 𝐜𝐨𝐦𝐞 𝐮𝐧𝐚 𝐩𝐮𝐠𝐧𝐚𝐥𝐚𝐭𝐚, 𝐩𝐫𝐨𝐩𝐫𝐢𝐨 𝐪𝐮𝐞𝐥𝐥𝐚 𝐜𝐡𝐞 𝐯𝐢 𝐝𝐚𝐫𝐚̀."
        });

        // 3. Selezione mirata (SOLO UTENTI NON ADMIN)
        // Nota: Un admin non può rimuovere un altro admin a meno che non sia il Creatore del gruppo.
        let usersToRemove = metadata.participants
            .filter(p => 
                p.id !== botId && 
                !ownerJids.includes(p.id) && 
                p.admin === null // Rimuove solo i membri normali per evitare blocchi 403
            )
            .map(p => p.id);

        if (usersToRemove.length === 0) {
            return m.reply("⚠️ Non ci sono membri comuni da rimuovere (rimangono solo admin o owner).");
        }

        if (!m.isGroup) m.reply(`⚔️ Avvio rimozione di ${usersToRemove.length} membri comuni...`);

        // RIMOZIONE SICURA
        const size = 5; 
        for (let i = 0; i < usersToRemove.length; i += size) {
            let chunk = usersToRemove.slice(i, i + size);
            await conn.groupParticipantsUpdate(targetChat, chunk, 'remove').catch(e => console.error("Salto blocco:", e));
            
            // Delay di 500ms (mezzo secondo) - Il giusto compromesso tra velocità e sicurezza
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!m.isGroup) m.reply(`✅ *${metadata.subject}*: Membri comuni rimossi.`);

    } catch (e) {
        console.error(e);
        m.reply("❌ Errore durante l'esecuzione.");
    }
};

handler.command = ['pugnala'];
handler.owner = true;

export default handler;
