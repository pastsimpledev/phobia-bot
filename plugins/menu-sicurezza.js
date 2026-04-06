import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix: _p, command, args, isOwner, isAdmin }) => {
  const userName = m.pushName || 'Utente'
  
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  global.db.data.settings[conn.user.jid] = global.db.data.settings[conn.user.jid] || {}
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid]

  const dynamicContextInfo = {
    externalAdReply: {
      title: "🛡️ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 🛡️",
      body: "ᴘʀᴏᴛᴏᴄᴏʟʟɪ ᴅɪ ᴅɪꜰᴇsᴀ ᴀᴛᴛɪᴠɪ",
      mediaType: 1,
      renderLargerThumbnail: true,
      thumbnailUrl: 'https://files.catbox.moe/u8o020.jpg',
      sourceUrl: 'https://whatsapp.com/channel/0029Vajp6GvK0NBoP7WlR81G'
    }
  }

  // --- LISTA COMPLETA REINTEGRATA DAGLI SCREENSHOT ---
  const securityFeatures = [
    { key: 'antigore', name: '🚫 Antigore' },
    { key: 'modoadmin', name: '🛡️ Soloadmin' },
    { key: 'antivoip', name: '📞 Antivoip' },
    { key: 'antilink', name: '🔗 Antilink' },
    { key: 'antilinksocial', name: '🌐 Antilinksocial' },
    { key: 'antitrava', name: '🛡️ Antitrava' },
    { key: 'antinuke', name: '☢️ Antinuke' },
    { key: 'antiviewonce', name: '👁️ Antiviewonce' },
    { key: 'antispam', name: '🛑 Antispam' }
  ]

  const automationFeatures = [
    { key: 'ai', name: '🧠 IA' },
    { key: 'vocali', name: '🎤 Siri' },
    { key: 'reaction', name: '😎 Reazioni' },
    { key: 'autolevelup', name: '⬆️ Autolivello' },
    { key: 'welcome', name: '👋 Welcome' }
  ]

  // SE NON CI SONO ARGOMENTI: MOSTRA IL MENU
  if (!args.length) {
    let text = `
┎━━━━━━━━━━━━━━━━━━━┑
┃   ✧  𝐁𝐋𝐃 - 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘  ✧   ┃
┖━━━━━━━━━━━━━━━━━━━┙
┌───────────────────┐
  👤 𝚄𝚜𝚎𝚛: ${userName}
  🛡️ 𝚂𝚝𝚊𝚝𝚞𝚜: 𝙰𝚌𝚝𝚒𝚟𝚎
└───────────────────┘

*〘 ɪɴstruᴢɪᴏɴɪ ᴏᴘᴇʀᴀᴛɪᴠᴇ 〙*
> Usa i seguenti comandi per configurare il sistema:
*│ ➤* ${_p}*attiva* <funzione>
*│ ➤* ${_p}*disattiva* <funzione>

*┍━━━〔 🛡️ sɪᴄᴜʀᴇᴢᴢᴀ 〕━━━┑*
${securityFeatures.map(f => `┇ ${f.name}  *➤* ${f.key}`).join('\n')}
*┕━━━━━──ׄ──ׅ──ׄ──━━━━━┙*

*┍━━━〔 🤖 ᴀᴜᴛᴏᴍᴀᴢɪᴏɴᴇ 〕━━━┑*
${automationFeatures.map(f => `┇ ${f.name}  *➤* ${f.key}`).join('\n')}
*┕━━━━━──ׄ──ׅ──ׄ──━━━━━┙*
`
    if (isOwner) {
      text += `\n*┍━━━〔 👑 ᴏᴡɴᴇʀ ᴄᴏɴᴛʀᴏʟ 〕━━━┑*\n┇ ⭐ Antichiamate ➤ anticall\n┇ ⭐ Antiprivato ➤ antiPrivate\n┇ ⭐ Solo Creatore ➤ soloCreatore\n*┕━━━━━──ׄ──ׅ──ׄ──━━━━━┙*`
    }

    text += `\n\n_ʙʟᴅ-ʙᴏᴛ sᴇᴄᴜʀɪᴛʏ ɪɴᴛᴇʀꜰᴀᴄᴇ_`

    await conn.sendMessage(m.chat, { text: text.trim(), contextInfo: dynamicContextInfo }, { quoted: m })
    return
  }

  // LOGICA DI ATTIVAZIONE (SPOSTAMENTO SUL DATABASE)
  let isEnable = !/disattiva|off|0/i.test(command)
  let type = args[0].toLowerCase()
  let status = isEnable ? 'ATTIVATO ✅' : 'DISATTIVATO ❌'

  // Mappatura nomi input -> variabili database reali
  let dbKey = type
  if (type === 'antilink') dbKey = 'antiLink'
  if (type === 'antilinksocial') dbKey = 'antiLink2'
  if (type === 'antiviewonce') dbKey = 'antioneview'
  if (type === 'antiprivato') dbKey = 'antiPrivate'

  // Verifica permessi
  const isSecurity = securityFeatures.some(f => f.key.toLowerCase() === type)
  const isAuto = automationFeatures.some(f => f.key.toLowerCase() === type)
  const isOwnerKey = ['anticall', 'antiprivate', 'solocreatore'].includes(type)

  if (isSecurity || isAuto) {
    if (!m.isGroup && !isOwner) return m.reply('❌ Solo nei gruppi')
    if (m.isGroup && !isAdmin && !isOwner) return m.reply('🛡️ Solo per Admin')
    chat[dbKey] = isEnable
  } else if (isOwnerKey) {
    if (!isOwner) return m.reply('👑 Solo Owner')
    bot[dbKey] = isEnable
  } else {
    return m.reply('❓ Funzione non trovata. Controlla la lista.')
  }

  await m.react(isEnable ? '✅' : '❌')
  m.reply(`『 🛡️ 』 *SISTEMA AGGIORNATO*\n\nModulo: *${type.toUpperCase()}*\nStato: *${status}*`)
}

handler.help = ['attiva', 'disattiva']
handler.tags = ['sicurezza']
handler.command = ['attiva', 'disattiva', 'on', 'off', 'enable', 'disable']

export default handler
