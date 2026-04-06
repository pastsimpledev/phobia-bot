import { promises } from 'fs'
import { join } from 'path'
import moment from 'moment-timezone'

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
 
 *Seleziona un modulo operativo:*
`.trimStart(),
  header: '      ⋆｡˚『 %category 』˚｡⋆\n╭',
  body: '*│ ➢* 『%emoji』 %cmd',
  footer: '*╰━━━━━━━──────━━━━━━━*\n',
  after: `_Powered by BLD-BOT Interface_`,
}

const MENU_IMAGE_URL = 'https://i.ibb.co/hJW7WwxV/varebot.jpg';

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    let name = await conn.getName(m.sender) || 'User';
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);
    let totalreg = Object.keys(global.db.data.users).length;

    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
      };
    });

    let menuTags = Object.keys(tags);
    let _text = [
      defaultMenu.before,
      ...menuTags.map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help[0]).map(menu => {
            return menu.help.map(help => {
              return defaultMenu.body
                .replace(/%cmd/g, menu.prefix ? help : _p + help)
                .replace(/%emoji/g, emojicategoria[tag] || '🔹')
                .trim();
            }).join('\n');
          }),
          defaultMenu.footer
        ].join('\n');
      }),
      defaultMenu.after
    ].join('\n');

    let replace = { '%': '%', p: _p, uptime, name, totalreg };
    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name]);

    // --- TEMPLATE BUTTONS (UNICO FORMATO COMPATIBILE IOS 2024/2025) ---
    // Inseriamo i primi 5 menu come tasti rapidi (limite iOS per visualizzazione corretta)
    // E aggiungiamo un tasto "Vedi Altri" o la lista testuale per gli altri 3
    const templateButtons = [
      { index: 1, quickReplyButton: { displayText: '🛡️ SICUREZZA', id: _p + 'attiva' } },
      { index: 2, quickReplyButton: { displayText: '🎮 GIOCHI', id: _p + 'menugiochi' } },
      { index: 3, quickReplyButton: { displayText: '🤖 IA', id: _p + 'menuia' } },
      { index: 4, quickReplyButton: { displayText: '👥 GRUPPO', id: _p + 'menugruppo' } },
      { index: 5, quickReplyButton: { displayText: '📥 DOWNLOAD', id: _p + 'menudownload' } }
    ];

    // Se vuoi proprio TUTTI gli 8 menu, iOS spesso taglia dopo i primi 5. 
    // Per sicurezza aggiungiamo il richiamo testuale degli ultimi 3 nel corpo del testo
    let finalBody = text + `\n\n*ALTRE SEZIONI:*\n🛠️ .${_p}menustrumenti\n⭐ .${_p}menupremium\n👨‍💻 .${_p}menucreatore`;

    await conn.sendMessage(m.chat, {
      image: { url: MENU_IMAGE_URL },
      caption: finalBody.trim(),
      footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
      templateButtons: templateButtons,
      viewOnce: true
    }, { quoted: m });

    await m.react('💠');

  } catch (e) {
    console.error(e);
  }
};

handler.help = ['menu'];
handler.command = ['menu', 'help'];
export default handler;

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
