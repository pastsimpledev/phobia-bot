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

    let replace = {
      '%': '%',
      p: _p,
      uptime: uptime,
      name: name,
      totalreg: totalreg,
    };

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name]);

    // --- DEFINIZIONE DELLE 8 SEZIONI (LISTA UNIFICATA) ---
    const sections = [
      {
        title: "🛡️ SISTEMA DI SICUREZZA",
        rows: [
          { header: "『 🛡️ 』", title: "MENU SICUREZZA", description: "Configura Antilink e Difese", id: _p + "attiva" }
        ]
      },
      {
        title: "🎮 AREA DIVERTIMENTO",
        rows: [
          { header: "『 🎮 』", title: "MENU GIOCHI", description: "Sfide e Classifiche", id: _p + "menugiochi" }
        ]
      },
      {
        title: "📂 TUTTI I MODULI OPERATIVI",
        rows: [
          { header: "『 🤖 』", title: "Menu IA", description: "Intelligenza Artificiale", id: _p + "menuia" },
          { header: "『 👥 』", title: "Menu Gruppo", description: "Gestione membri", id: _p + "menugruppo" },
          { header: "『 📥 』", title: "Menu Download", description: "Scarica video/musica", id: _p + "menudownload" },
          { header: "『 🛠️ 』", title: "Menu Strumenti", description: "Utility varie", id: _p + "menustrumenti" },
          { header: "『 ⭐ 』", title: "Menu Premium", description: "Funzioni esclusive", id: _p + "menupremium" },
          { header: "『 👨‍💻 』", title: "Menu Creatore", description: "Comandi Owner", id: _p + "menucreatore" }
        ]
      }
    ];

    // MESSAGGIO LISTA (Protocollo compatibile iPhone/Android)
    await conn.sendList(m.chat, 
      "💠 BLD-BOT SYSTEM", // Titolo piccolo
      text.trim(),        // Testo principale (HUD)
      "💠 SELEZIONA MODULO", // Testo sul tasto
      MENU_IMAGE_URL,     // Immagine
      sections,           // Le 8 voci
      m
    );

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
