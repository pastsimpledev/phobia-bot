import fetch from 'node-fetch';

const PERM = {
  ADMIN: 'admin',
  OWNER: 'owner',
  sam: 'sam',
};

const featureRegistry = [
  { key: 'welcome', store: 'chat', perm: PERM.ADMIN, aliases: ['benvenuto'], groupOnly: true, name: '👋 Welcome', desc: 'Messaggio di benvenuto' },
  { key: 'goodbye', store: 'chat', perm: PERM.ADMIN, aliases: ['addio'], groupOnly: true, name: '🚪 Addio', desc: 'Messaggio di addio' },
  { key: 'antispam', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '🛑 Antispam', desc: 'Antispam' },
  { key: 'antisondaggi', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '📊🚫 Anti-sondaggi', desc: 'Blocca la creazione di sondaggi (solo non-admin)' },
  { key: 'antiparolacce', store: 'chat', perm: PERM.ADMIN, aliases: ['antitossici'], name: '🧼 Filtro parolacce', desc: 'Avverte e rimuove per parolacce/insulti' },
  { key: 'antiBot', store: 'chat', perm: PERM.ADMIN, aliases: ['antibot', 'antibots'], name: '🤖❌ Antibot', desc: 'Rimuove eventuali bot indesiderati' },
  { key: 'antiBot2', store: 'chat', perm: PERM.ADMIN, aliases: ['antisubbots', 'antisub'], name: '🤖🚫 Anti-subbots', desc: 'Blocca sub-bot nel gruppo' },
  { key: 'antitrava', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '🧨❌ Antitrava', desc: 'Blocca messaggi troppo lunghi (trava)' },
  { key: 'antimedia', store: 'chat', perm: PERM.ADMIN, aliases: [], groupOnly: true, name: '🖼️❌ Antimedia', desc: 'Elimina foto/video permanenti' },
  { key: 'antioneview', store: 'chat', perm: PERM.ADMIN, aliases: ['antiviewonce'], groupOnly: true, name: '👁️‍🗨️ Antiviewonce', desc: 'Antiviewonce' },
  { key: 'antitagall', store: 'chat', perm: PERM.ADMIN, aliases: ['anti-tagall', 'antimentioni'], groupOnly: true, name: '🏷️🚫 Anti-tagall', desc: 'Elimina e avverte se vengono menzionati troppi membri' },
  { key: 'autotrascrizione', store: 'chat', perm: PERM.ADMIN, aliases: ['autotrascrivi', 'autotranscribe', 'autotranscription'], groupOnly: true, name: '📝🎧 Auto-trascrizione', desc: 'Trascrive automaticamente i vocali/audio (anche view-once)' },
  { key: 'autotraduzione', store: 'chat', perm: PERM.ADMIN, aliases: ['autotraduci', 'autotranslate'], groupOnly: true, name: '🌍🈯 Auto-traduzione', desc: 'Traduce automaticamente i messaggi (in italiano)' },
  { key: 'rileva', store: 'chat', perm: PERM.ADMIN, aliases: ['detect'], groupOnly: true, name: '📡 Rileva', desc: 'Rileva eventi gruppo' },
  { key: 'antiporno', store: 'chat', perm: PERM.ADMIN, aliases: ['antiporn', 'antinsfw'], name: '🔞 Antiporno', desc: 'Antiporno' },
  { key: 'antigore', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '🚫 Antigore', desc: 'Antigore' },
  { key: 'modoadmin', store: 'chat', perm: PERM.ADMIN, aliases: ['soloadmin'], name: '🛡️ Soloadmin', desc: 'Solo gli admin possono usare i comandi' },
  { key: 'ai', store: 'chat', perm: PERM.ADMIN, aliases: ['ia'], groupOnly: true, name: '🧠 IA', desc: 'Intelligenza artificiale' },
  { key: 'vocali', store: 'chat', perm: PERM.ADMIN, aliases: ['siri'], groupOnly: true, name: '🎤 Siri', desc: 'Risponde con audio agli audio e msg ricevuti' },
  { key: 'antivoip', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '📞❌ Antivoip', desc: 'Antivoip' },
  { key: 'antiLink', store: 'chat', perm: PERM.ADMIN, aliases: ['antilink', 'nolink'], name: '🔗❌ Antilink', desc: 'Antilink whatsapp' },
  { key: 'antiLinkUni', store: 'chat', perm: PERM.ADMIN, aliases: ['antilinkuni', 'antilinkuniversale', 'antilinktutto'], name: '🌍🔗❌ Antilink universale', desc: 'Blocca tutti i tipi di link' },
  { key: 'antiLink2', store: 'chat', perm: PERM.ADMIN, aliases: ['antilink2', 'antilinkhard', 'antilinksocial'], name: '🌐❌ Antilinksocial', desc: 'Blocca tutti i link di social. Per singoli: .attiva antiig/antitiktok/antiyt..' },
  { key: 'reaction', store: 'chat', perm: PERM.ADMIN, aliases: ['reazioni'], groupOnly: true, name: '😎 Reazioni', desc: 'Reazioni automatiche' },
  { key: 'autolevelup', store: 'chat', perm: PERM.ADMIN, aliases: ['autolivello', 'autolvl'], name: '⬆️ Autolivello', desc: 'Messaggio di livello automatico' },
  { key: 'antinuke', store: 'chat', perm: PERM.OWNER, aliases: ['antidistruzione'], groupOnly: true, name: '🛡️ Antinuke', desc: 'Protezione totale contro raid' },
  { key: 'antiprivato', store: 'bot', perm: PERM.OWNER, aliases: ['antipriv'], name: '🔒 Blocco privato', desc: 'Blocca chi scrive in privato al bot' },
  { key: 'soloe', store: 'bot', perm: PERM.sam, aliases: ['solocreatore', 'solowner', 'soloowner'], name: '👑 Solocreatore', desc: 'Solo Blood può usare i comandi' },
  { key: 'multiprefix', store: 'bot', perm: PERM.OWNER, aliases: ['multiprefisso', 'multipref'], onToggle: 'multiprefix', name: '🔣 Multiprefix', desc: 'Permette più prefissi (es: .!/)' },
  { key: 'jadibotmd', store: 'bot', perm: PERM.OWNER, aliases: ['subbots', 'jadibotmd'], name: '🧬 Subbots', desc: 'Bot multi-sessione' },
  { key: 'antispambot', store: 'bot', perm: PERM.OWNER, aliases: [], name: '🤖🛑 Anti-spam comandi', desc: 'Limita lo spam di comandi (globale)' },
  { key: 'autoread', store: 'bot', perm: PERM.OWNER, aliases: ['read', 'lettura'], name: '👀 Lettura', desc: 'Il bot legge automaticamente i messaggi' },
  { key: 'anticall', store: 'bot', perm: PERM.sam, aliases: [], name: '❌📞 Antichiamate', desc: 'Rifiuta automaticamente le chiamate' },
  { key: 'registrazioni', store: 'bot', perm: PERM.OWNER, aliases: ['registrazione', 'reg'], name: '📛 Obbligo registrazione', desc: 'Richiede registrazione per usare il bot' },
];

const aliasMap = new Map();
for (const feat of featureRegistry) {
  aliasMap.set(feat.key.toLowerCase(), feat);
  for (const alias of feat.aliases) {
    aliasMap.set(alias.toLowerCase(), feat);
  }
}

const adminkeyz = new Set([
  'welcome', 'goodbye', 'antispam', 'antisondaggi', 'antiparolacce',
  'antiBot', 'antitrava', 'antimedia', 'antioneview', 'antitagall',
  'autotrascrizione', 'autotraduzione', 'rileva', 'antiporno', 'antigore',
  'modoadmin', 'ai', 'vocali', 'antivoip', 'antiLink', 'antiLinkUni',
  'antiLink2', 'reaction', 'autolevelup'
]);
const ownerkeyz = new Set([
  'antinuke', 'antiprivato', 'soloe', 'multiprefix', 'jadibotmd',
  'antispambot', 'autoread', 'anticall', 'registrazioni'
]);

const adminz = featureRegistry.filter(f => adminkeyz.has(f.key));
const ownerz = featureRegistry.filter(f => ownerkeyz.has(f.key));

function checkPermission(feat, { m, isAdmin, isOwner, isSam }) {
  if (feat.groupOnly && !m.isGroup && !isOwner) {
    return '『 ❌ 』 Comando valido solo nei gruppi';
  }
  switch (feat.perm) {
    case PERM.sam:
      if (!isSam) return '『 ❌ 』 Accesso negato: Solo Blood può gestire questa funzione';
      break;
    case PERM.OWNER:
      if (!isOwner && !isSam) return '『 ❌ 』 Accesso negato: Solo Blood può gestire questa funzione';
      break;
    case PERM.ADMIN:
      if (m.isGroup && !(isAdmin || isOwner || isSam))
        return '\n- 〘 🛠️ 〙 *`ꪶ͢Solo gli admin del gruppo possono usare questo comandoꫂ`*';
      break;
  }
  return null;
}

function handleMultiprefixToggle(bot) {
  try {
    const defaultSinglePrefix = (typeof global.prefisso === 'string' && global.prefisso.trim()) ? global.prefisso.trim() : '.';
    const raw = typeof bot.prefix === 'string' ? bot.prefix.trim() : '';
    const p = (bot.multiprefix === true && (!raw || raw.length <= 1)) ? (raw || global.opts.prefix) : (raw || defaultSinglePrefix);
    if (bot.multiprefix === true) {
      global.prefix = new RegExp('^[' + String(p).replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
    } else {
      const c = String(p)[0] || '.';
      global.prefix = new RegExp('^' + String(c).replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&'));
    }
  } catch {}
}

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isSam }) => {
  const userName = m.pushName || 'User';

  let groupProfilePicBuffer;
  try {
    const profilePicUrl = await conn.profilePictureUrl(m.chat, 'image');
    const ab = await (await fetch(profilePicUrl)).arrayBuffer();
    groupProfilePicBuffer = Buffer.from(ab);
  } catch (e) {
    try {
      const ab2 = await (await fetch(global.foto)).arrayBuffer();
      groupProfilePicBuffer = Buffer.from(ab2);
    } catch (e2) {
      groupProfilePicBuffer = Buffer.from([]);
    }
  }

  let dynamicContextInfo;
  if (global.fake && global.fake.contextInfo) {
    dynamicContextInfo = global.fake.contextInfo;
  } else {
    dynamicContextInfo = {
      externalAdReply: {
        title: "BLD-BLOOD",
        body: "Terminal Control Center",
        mediaType: 1,
        jpegThumbnail: groupProfilePicBuffer
      }
    };
  }

  let isEnable = /true|enable|attiva|(turn)?on|1/i.test(command);
  if (/disable|disattiva|off|0/i.test(command)) isEnable = false;

  global.db.data.chats = global.db.data.chats || {};
  global.db.data.users = global.db.data.users || {};
  global.db.data.settings = global.db.data.settings || {};
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
  global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
  const botJid = conn.decodeJid(conn.user.jid);
  global.db.data.settings[botJid] = global.db.data.settings[botJid] || {};
  let chat = global.db.data.chats[m.chat];
  let bot = global.db.data.settings[botJid];

  const getStatus = (key) => {
    const feat = aliasMap.get(key.toLowerCase());
    if (!feat) return false;
    const target = feat.store === 'bot' ? bot : chat;
    return target[feat.key] || false;
  };

  const createSections = (features) => {
    const active = features.filter(f => getStatus(f.key));
    const inactive = features.filter(f => !getStatus(f.key));
    return [
      { title: '🔴 DISATTIVATI', rows: inactive.map(f => ({ title: f.name, description: f.desc, id: `${usedPrefix}attiva ${f.key}` })) },
      { title: '🟢 ATTIVATI', rows: active.map(f => ({ title: f.name, description: f.desc, id: `${usedPrefix}disattiva ${f.key}` })) }
    ];
  };

  const buildVcard = () => `BEGIN:VCARD\nVERSION:3.0\nN:;${userName};;;\nFN:${userName}\nitem1.X-ABLabel:📱 Cellulare\nitem1.TEL;waid=${m.sender.split('@')[0]}:+${m.sender.split('@')[0]}\nEND:VCARD`;

  if (!args.length) {
    const adminSections = createSections(adminz);
    const ownerSections = createSections(ownerz);
    const bldLogo = 'https://i.ibb.co/kVdFLyGL/sam.jpg'; // O il tuo link locale

    const adminCard = {
      image: { url: bldLogo },
      title: '『 👥 』 \`PANEL ADMIN\`',
      body: '🛡️ Gestione sicurezza e utility del gruppo.',
      footer: '⚙️ BLD-BLOOD CORE',
      buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify({ title: 'Configura Gruppo', sections: adminSections }) }]
    };

    let cards = [adminCard];
    if (isOwner || isSam) {
      cards.push({
        image: { url: 'https://i.ibb.co/kVdFLyGL/sam.jpg' },
        title: '『 👑 』 \`PANEL BLOOD\`',
        body: '⚠️ Accesso riservato al creatore Blood.',
        footer: '⚙️ BLD-BLOOD CORE',
        buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify({ title: 'Configura Sistema', sections: ownerSections }) }]
      });
    }

    const fkontak_menu = {
      key: { participant: m.sender, remoteJid: '0@s.whatsapp.net', fromMe: false, id: 'BLD-BLOOD' },
      message: { contactMessage: { displayName: userName, vcard: buildVcard(), jpegThumbnail: groupProfilePicBuffer } },
      participant: m.sender
    };

    return conn.sendMessage(m.chat, {
      text: '*SYSTEM CONTROL CENTER*',
      footer: '*─ׄ✦☾⋆⁺₊✧ BLD-BLOOD ✧₊⁺⋆☽✦─ׅ⭒*',
      cards,
      contextInfo: dynamicContextInfo
    }, { quoted: fkontak_menu });
  }

  let results = [];
  for (let type of args.map(arg => arg.toLowerCase())) {
    let result = { type, status: '', success: false };

    const feat = aliasMap.get(type);
    if (!feat) {
      result.status = '『 ❌ 』 Comando ignoto';
      results.push(result);
      continue;
    }

    const permError = checkPermission(feat, { m, isAdmin, isOwner, isSam });
    if (permError) {
      result.status = permError;
      results.push(result);
      continue;
    }

    const target = feat.store === 'bot' ? bot : chat;
    if (target[feat.key] === isEnable) {
      result.status = `『 ⚠️ 』 Stato già ${isEnable ? 'attivo' : 'disattivato'}`;
      results.push(result);
      continue;
    }

    target[feat.key] = isEnable;
    if (feat.onToggle === 'multiprefix') handleMultiprefixToggle(bot);

    result.status = `『 ✅ 』 Operazione completata`;
    result.success = true;
    results.push(result);
  }

  let summaryMessage = `『 🉐 』 \`LOG MODIFICHE BLD-BLOOD\`\n\n`;
  for (const result of results) {
    const cleanType = String(result.type || '').toUpperCase();
    summaryMessage += `- *[${cleanType}]*: ${result.status}\n`;
  }

  const fkontak_confirm = {
    key: { participant: m.sender, remoteJid: '0@s.whatsapp.net', fromMe: false, id: 'BLOOD-SYS' },
    message: { contactMessage: { displayName: userName, vcard: buildVcard(), jpegThumbnail: groupProfilePicBuffer } },
    participant: m.sender
  };

  await conn.sendMessage(m.chat, { text: summaryMessage, contextInfo: dynamicContextInfo }, { quoted: fkontak_confirm });
};

handler.help = ['attiva', 'disattiva'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'];

export default handler;
