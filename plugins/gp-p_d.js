let handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
  const chat = global.db.data.chats[m.chat]
  const isAntinukeOn = chat?.antinuke

  // --- LOGICA PERMESSI DINAMICI ---
  // Se l'antinuke è attivo, solo l'owner può procedere.
  // Se è spento, possono farlo sia owner che admin.
  if (isAntinukeOn) {
    if (!isOwner) return conn.reply(m.chat, '『 🛡️ 』 𝐀𝐧𝐭𝐢𝐧𝐮𝐤𝐞 𝐀𝐭𝐭𝐢𝐯𝐨: solo il Creatore può usare questo comando.', m)
  } else {
    if (!isAdmin && !isOwner) return conn.reply(m.chat, '『 👤 』 Questo comando è riservato agli Admin.', m)
  }

  let action, successMsg, errorMsg
  let sender = m.sender

  let number
  if (m.mentionedJid && m.mentionedJid[0]) {
    number = m.mentionedJid[0].split('@')[0]
  } else if (m.quoted && m.quoted.sender) {
    number = m.quoted.sender.split('@')[0]
  } else if (text && !isNaN(text.replace(/[^0-9]/g, ''))) {
    number = text.replace(/[^0-9]/g, '')
  } else {
    return conn.reply(m.chat, '『 👤 』 𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭 e, quota un messaggio o scrivi il numero', m)
  }

  if (!number || number.length < 7 || number.length > 15) {
    return conn.reply(m.chat, '『 ❌ 』 𝐍𝐮𝐦𝐞𝐫𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨', m)
  }

  let user = number + '@s.whatsapp.net'

  if (['promote', 'promuovi', 'p'].includes(command)) {
    action = 'promote'
    successMsg = `『 👑 』 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 @${user.split('@')[0]} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐢𝐧𝐜𝐨𝐫𝐨𝐧𝐚𝐭𝐨/𝐚 \n\n𝐃𝐚: @${sender.split('@')[0]}`
    errorMsg = '『 ❌ 』 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥 𝐩𝐫𝐨𝐦𝐮𝐨𝐯𝐞𝐫𝐞 (Forse è già admin?)'
  }

  if (['demote', 'retrocedi', 'r'].includes(command)) {
    action = 'demote'
    successMsg = `『 ⚠️ 』 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 @${user.split('@')[0]} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐛𝐮𝐥𝐥𝐢𝐳𝐳𝐚𝐭𝐨\n\n𝐃𝐚: @${sender.split('@')[0]}`
    errorMsg = '『 ❌ 』 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐝𝐞𝐫𝐞 (Forse non è admin?)'
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], action)
    conn.reply(m.chat, successMsg, m, {
      mentions: [sender, user]
    })
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, errorMsg, m)
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['group']
handler.command = ['promote', 'promuovi', 'p', 'demote', 'retrocedi', 'r']
handler.group = true
handler.botAdmin = true

export default handler
