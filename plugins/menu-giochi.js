import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'

const defaultMenu = {
  before: `
╔════════════════════╗
  🎮  *G A M E  C E N T E R* 🎮
╚════════════════════╝
 ┌───────────────────
 │ 👤 *Utente:* %name
 │ 🏆 *Livello:* %level
 │ 💰 *Eris:* %eris
 │ 🎖️ *Rango:* %role
 └───────────────────
 
 *Seleziona una sfida:*
`.trimStart(),
  header: '╭──〔 %category 〕──✦',
  body: '│ 🕹️  %cmd %islimit%isPremium',
  footer: '╰───────────────━━━━\n',
  after: `_Usa %p [comando] per giocare_`,
}

let handler = async (m, { conn, usedPrefix: _p, __dirname, args, command }) => {
  let tags = { 'giochi': 'GIOCHI DISPONIBILI' }

  try {
    // ----------------- DATI BASE -----------------
    let d = new Date(new Date().getTime() + 3600000)
    let locale = 'it'
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
    let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' })
    let _uptime = process.uptime() * 1000

    let muptime
    if (process.send) {
      process.send('uptime')
      muptime = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }

    let uptime = clockString(_uptime)
    let muptimeStr = clockString(muptime)
    let wib = moment.tz('Europe/Rome').format('HH:mm:ss')
    let mode = global.opts?.self ? 'Privato' : 'Pubblico'
    let _package = JSON.parse(await promises.readFile(join(__dirname, '../package.json')).catch(_ => ({}))) || {}

    // ----------------- DATI UTENTE -----------------
    let user = global.db.data.users[m.sender] || {}
    let { age = 0, exp = 0, limit = 10, level = 1, role = 'Utente', registered = false, eris = 0, premiumTime = 0 } = user
    let { min, xp, max } = xpRange(level, global.multiplier || 1)
    let name = await conn.getName(m.sender)
    let prems = premiumTime > 0 ? '💎 Premium' : '👤 Utente comune'
    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(u => u.registered).length

    // ----------------- PLUGIN HELP -----------------
    let help = Object.values(global.plugins)
      .filter(p => !p.disabled)
      .map(p => ({
        help: Array.isArray(p.help) ? p.help : [p.help],
        tags: Array.isArray(p.tags) ? p.tags : [p.tags],
        prefix: 'customPrefix' in p,
        limit: p.limit,
        premium: p.premium,
        enabled: !p.disabled
      }))

    // raggruppa plugin per tag
    let groups = {}
    for (let tag in tags) {
      groups[tag] = help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help[0])
    }

    // ----------------- COSTRUZIONE MENU -----------------
    let before = conn.menu?.before || defaultMenu.before
    let header = conn.menu?.header || defaultMenu.header
    let body = conn.menu?.body || defaultMenu.body
    let footer = conn.menu?.footer || defaultMenu.footer
    let after = conn.menu?.after || defaultMenu.after

    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag]) + '\n' +
          [
            ...groups[tag].map(menu =>
              menu.help.map(cmd => body
                .replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
                .replace(/%islimit/g, menu.limit ? ' ⚠️' : '')
                .replace(/%isPremium/g, menu.premium ? ' 💎' : '')
                .trimEnd()
              ).join('\n')
            ),
            footer
          ].join('\n')
      }),
      after
    ].join('\n')

    let text = typeof conn.menu === 'string' ? conn.menu : _text

    // ----------------- SOSTITUZIONE VARIABILI -----------------
    let replace = {
      '%': '%',
      p: _p,
      muptime: muptimeStr,
      me: conn.getName(conn.user.jid),
      npmname: _package.name,
      npmdesc: _package.description,
      version: _package.version,
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      wib, mode, _p, eris, age, name, prems, level, limit,
      week, date, dateIslamic, time, totalreg, rtotalreg, role,
      readMore
    }

    text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    // ----------------- INVIO MENU -----------------
    await conn.sendMessage(m.chat, {
      text: text.trim(),
      mentions: [m.sender]
    }, { quoted: m })

    await m.react('🎮')

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Errore nel menu giochi:\n' + e.message, m)
  }
}

handler.help = ['menugiochi']
handler.tags = ['menu']
handler.command = ['menugiochi', 'menugame']

export default handler

// ------------------- UTILS -------------------
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  if (!ms) return '-- H -- M -- S'
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, ' H ', m, ' M ', s, ' S '].map(v => v.toString().padStart(2, '0')).join('')
}
