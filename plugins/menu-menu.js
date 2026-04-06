import { promises } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'

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
 
 *Seleziona un modulo operativo qui sotto:*
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

    // CONFIGURAZIONE BOTTONI NATIVI (FUNZIONANO SU IOS)
    const sections = [
      {
        title: "🛡️ SICUREZZA & GIOCHI",
        rows: [
          { title: "🛡️ Menu Sicurezza", id: _p + "attiva" },
          { title: "🎮 Menu Giochi", id: _p + "menugiochi" }
        ]
      },
      {
        title: "📂 MODULI OPERATIVI",
        rows: [
          { title: "🤖 Menu IA", id: _p + "menuia" },
          { title: "👥 Menu Gruppo", id: _p + "menugruppo" },
          { title: "📥 Menu Download", id: _p + "menudownload" },
          { title: "🛠️ Menu Strumenti", id: _p + "menustrumenti" },
          { title: "⭐ Menu Premium", id: _p + "menupremium" },
          { title: "👨‍💻 Menu Creatore", id: _p + "menucreatore" }
        ]
      }
    ];

    let message = {
      image: { url: MENU_IMAGE_URL },
      caption: text.trim(),
      footer: "B L D  S Y S T E M",
      buttons: [
        {
          name: "single_select",
          buttonParamsJson: JSON.stringify({
            title: "💠 APRI MENU COMPLETO",
            sections: sections
          })
        }
      ],
      headerType: 4,
      viewOnce: true
    };

    // Invio forzato come messaggio interattivo (Nuovo Protocollo)
    await conn.sendMessage(m.chat, message, { quoted: m });
    await m.react('💠');

  } catch (e) {
    console.error(e);
    // Se fallisce ancora, manda testo semplice con link cliccabili come emergenza
    conn.reply(m.chat, "Errore nel caricamento del menu interattivo.", m);
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
