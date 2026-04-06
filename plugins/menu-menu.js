import { promises } from 'fs'
import { join } from 'path'
import moment from 'moment-timezone'
import os from 'os'

const emojicategoria = {
  info: 'ℹ️',
  main: '💠',
  sicurezza: '🛡️'
}

let tags = {
  'main': '╭ *`SYSTEM MAIN`* ╯',
  'sicurezza': '╭ *`SECURITY SYSTEM`* ╯',
  'info': '╭ *`DATABASE INFO`* ╯'
}

const defaultMenu = {
  before: `
┏━━━━━━━━━━━━━━━━━━━━┓
   💠  *B L D  -  B O T* 💠
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 👤 *User:* %name
 │ 🕒 *Uptime:* %uptime
 │ 👥 *Total Users:* %totalreg
 └───────────────────
 
 *PANNELLO COMANDI (CLICCABILI):*
`.trimStart(),
  header: '      ⋆｡˚『 %category 』˚｡⋆\n╭',
  body: '*│ ➢* 『%emoji』 %cmd',
  footer: '*╰━━━━━━━──────━━━━━━━*\n',
  after: `
%readMore
*┍━━━━━〔 📂 SEZIONI 〕━━━━━┑*
┇ 🛡️ *.%pattiva* ┇ 🎮 *.%pmenugiochi* ┇ 🤖 *.%pmenuia* ┇ 👥 *.%pmenugruppo* ┇ 📥 *.%pmenudownload* ┇ 🛠️ *.%pmenustrumenti* ┇ ⭐ *.%pmenupremium* ┇ 👨‍💻 *.%pmenucreatore* *┕━━━━━━━──ׄ──ׅ──ׄ──━━━━━━━┙*

_Powered by BLD-BOT Interface_`,
}

const MENU_IMAGE_URL = 'https://i.ibb.co/hJW7WwxV/varebot.jpg';

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    let name = await conn.getName(m.sender) || 'User'
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length

    // Caricamento plugin per il corpo del menu
    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
      }
    })

    let menuTags = Object.keys(tags)
    let _text = [
      defaultMenu.before,
      ...menuTags.map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help[0]).map(menu => {
            return menu.help.map(help => {
              return defaultMenu.body
                .replace(/%cmd/g, menu.prefix ? help : _p + help)
                .replace(/%emoji/g, emojicategoria[tag] || '🔹')
                .trim()
            }).join('\n')
          }),
          defaultMenu.footer
        ].join('\n')
      }),
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%',
      p: _p,
      uptime: uptime,
      name: name,
      totalreg: totalreg,
      readMore: readMore // Inserisce il comando per nascondere il testo
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    // INVIO UNIFICATO (METODO TEXT-CAPTION)
    // Questo metodo è quello usato nel codice che hai postato:
    // Non usa Button Object, ma testo formattato cliccabile.
    await conn.sendMessage(m.chat, {
      image: { url: MENU_IMAGE_URL },
      caption: text.trim(),
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: "💠 𝐁𝐋𝐃 - 𝐂𝐄𝐍𝐓𝐑𝐀𝐋 𝐇𝐔𝐁 💠",
          body: "SISTEMA OPERATIVO ATTIVO",
          mediaType: 1,
          renderLargerThumbnail: true,
          thumbnailUrl: MENU_IMAGE_URL,
          sourceUrl: 'https://whatsapp.com/channel/0029Vajp6GvK0NBoP7WlR81G'
        }
      }
    }, { quoted: m })

    await m.react('💠')

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Errore nel caricamento del menu.', m)
  }
}

handler.help = ['menu']
handler.command = ['menu', 'help']

export default handler

// UTILS PER IL FUNZIONAMENTO "TASTI TESTUALI"
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
