import { promises } from 'fs'
import { join } from 'path'
import moment from 'moment-timezone'

const emojicategoria = {
  info: '💉',
  main: '🩸'
}

let tags = {
  'main': '╭ *`𝐂𝐘𝐁𝐄𝐑 𝐁𝐋𝐎𝐎𝐃`* ╯',
  'info': '╭ *`𝐃𝐀𝐓𝐀 𝐋𝐄𝐀𝐊`* ╯'
}

const defaultMenu = {
  before: `
┏━━━━━━━━━━━━━━━━━━━━┓
   🩸  *C Y B E R - B L O O D* 🩸
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 🫀 *Soggetto:* %name
 │ ⏳ *Attivo da:* %uptime
 │ 🧬 *Nodi Connessi:* %totalreg
 └───────────────────
 
 *⚠️ Iniezione moduli in corso...*
`.trimStart(),
  header: '      ⋆｡˚『 %category 』˚｡⋆\n╭',
  body: '*│ ⚡* 『%emoji』%cmd',
  footer: '*╰━━━━━──ׄ──ׅ──ׄ──━━━━━*\n',
  after: `_☣️ Sistema operativo instabile..._`,
}

const MENU_IMAGE_URL = 'https://i.ibb.co/hJW7WwxV/varebot.jpg';

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    let name = await conn.getName(m.sender) || 'Soggetto Ignoto';
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
                .replace(/%emoji/g, emojicategoria[tag] || '💀')
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

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name]);
    
    const msgID = m.id || m.key?.id;
    const deviceType = detectDevice(msgID);

    if (deviceType === 'ios') {
      const randomMenus = getRandomMenus();
      const buttons = randomMenus.map(menu => ({
        buttonId: _p + menu.command,
        buttonText: { displayText: menu.title },
        type: 1
      }));

      await conn.sendMessage(m.chat, {
        image: { url: MENU_IMAGE_URL },
        caption: text.trim(),
        footer: "☣️ BLOOD INTERFACE",
        buttons: buttons,
        headerType: 4
      }, { quoted: m });

    } else {
      const sections = [
        {
          title: "💀 PROTOCOLLI ELITE 💀",
          rows: [
            { header: "『 🤖 』", title: "Invasione IA", description: "Moduli Intelligenza Artificiale", id: _p + "menuia" },
            { header: "『 💎 』", title: "Accesso Root", description: "Funzioni Premium", id: _p + "menupremium" }
          ]
        },
        {
          title: "💉 SETTORI DI SISTEMA",
          rows: [
            { header: "『 🛠️ 』", title: "Laboratorio", description: "Strumenti e utilità", id: _p + "menustrumenti" },
            { header: "『 💰 』", title: "Banca Nera", description: "Economia e Euro", id: _p + "menueuro" },
            { header: "『 🎮 』", title: "Arena Giochi", description: "Distrazione e Games", id: _p + "menugiochi" },
            { header: "『 👥 』", title: "Gestione Clan", description: "Comandi Gruppo", id: _p + "menugruppo" },
            { header: "『 🔍 』", title: "Deep Scan", description: "Ricerche online", id: _p + "menuricerche" },
            { header: "『 📥 』", title: "Extractor", description: "Download contenuti", id: _p + "menudownload" },
            { header: "『 👨‍💻 』", title: "Master Admin", description: "Comandi Owner", id: _p + "menucreatore" }
          ]
        }
      ];

      await conn.sendList(
        m.chat, 
        "",
        text.trim(),
        "🩸 APRI DATABASE SANGUE",
        MENU_IMAGE_URL,
        sections,
        m
      );
    }

    await m.react('💉');

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '☣️ ERRORE DI SISTEMA: ' + e.message, m)
  }
};

handler.help = ['menu'];
handler.command = ['menu', 'menuall', 'help'];
export default handler;

// --- UTILITIES ---

function detectDevice(msgID) {
  if (!msgID) return 'unknown';
  if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) return 'bot';
  if (msgID.startsWith('false_') || msgID.startsWith('true_')) return 'web';
  if (msgID.startsWith('3EB0') && /^[A-Z0-9]+$/.test(msgID)) return 'web';
  if (msgID.includes(':')) return 'desktop';
  if (/^[A-F0-9]{32}$/i.test(msgID)) return 'android';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)) return 'ios';
  if (/^[A-Z0-9]{20,25}$/i.test(msgID) && !msgID.startsWith('3EB0')) return 'ios';
  return 'unknown';
}

function getRandomMenus() {
  const allMenus = [
    { title: "🤖 Menu IA", command: "menuia" },
    { title: "💎 Menu Premium", command: "menupremium" },
    { title: "🛠️ Menu Strumenti", command: "menustrumenti" },
    { title: "💰 Menu Euro", command: "menueuro" },
    { title: "🎮 Menu Giochi", command: "menugiochi" },
    { title: "👥 Menu Gruppo", command: "menugruppo" },
    { title: "🔍 Menu Ricerche", command: "menuricerche" },
    { title: "📥 Menu Download", command: "menudownload" },
    { title: "👨‍💻 Menu Creatore", command: "menucreatore" }
  ];
  return allMenus.sort(() => 0.5 - Math.random()).slice(0, 5);
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
