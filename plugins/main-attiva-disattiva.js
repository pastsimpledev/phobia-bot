import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  const userName = m.pushName || 'Utente';

  // Gestione Immagine Profilo / Thumbnail
  let userProfilePicBuffer;
  try {
    const profilePicUrl = await conn.profilePictureUrl(m.sender, 'image');
    userProfilePicBuffer = await (await fetch(profilePicUrl)).arrayBuffer();
  } catch (e) {
    try {
      userProfilePicBuffer = await (await fetch(global.foto)).arrayBuffer();
    } catch (e2) {
      userProfilePicBuffer = Buffer.from([]);
    }
  }

  // Configurazione ContextInfo (Stile BloodBot)
  let dynamicContextInfo = {
    externalAdReply: {
      title: "𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 - 𝖲𝗒𝗌𝗍𝖾𝗆 𝖢𝗈𝗇𝗍𝗋𝗈𝗅",
      body: "Pannello Gestione Funzioni",
      mediaType: 1,
      previewType: 0,
      renderLargerThumbnail: true,
      thumbnailUrl: 'https://files.catbox.moe/u8o020.jpg', // Tua immagine personalizzata
      sourceUrl: 'https://whatsapp.com/channel/your-link'
    }
  };

  // Logica Attivazione/Disattivazione
  let isEnable = /true|enable|attiva|(turn)?on|1/i.test(command);
  if (/disable|disattiva|off|0/i.test(command)) isEnable = false;

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
  global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
  let chat = global.db.data.chats[m.chat];
  let bot = global.db.data.settings[conn.user.jid] || {};

  // --- CATEGORIE COMANDI ---

  const adminFeatures = [
    { key: 'welcome', name: '👋 Welcome', desc: 'Benvenuto' },
    { key: 'goodbye', name: '🚪 Addio', desc: 'Addio' },
    { key: 'rileva', name: '📡 Rileva', desc: 'Eventi gruppo' },
    { key: 'modoadmin', name: '🛡️ Soloadmin', desc: 'Comandi solo per admin' },
    { key: 'ai', name: '🧠 IA', desc: 'Intelligenza artificiale' },
    { key: 'vocali', name: '🎤 Siri', desc: 'Risposte vocali' },
    { key: 'reaction', name: '😎 Reazioni', desc: 'Reazioni automatiche' },
    { key: 'autolevelup', name: '⬆️ Autolivello', desc: 'Level up automatico' }
  ];

  const securityFeatures = [
    { key: 'antispam', name: '🛑 Antispam', desc: 'Blocca lo spam' },
    { key: 'antiBot', name: '🤖 Antibot', desc: 'Rimuove bot' },
    { key: 'antiLink', name: '🔗 Antilink WA', desc: 'Link gruppi WhatsApp' },
    { key: 'antiLink2', name: '🌐 Antilink Social', desc: 'Link social media' },
    { key: 'antinuke', name: '☢️ Antinuke', desc: 'Sicurezza massima' },
    { key: 'antitrava', name: '🛡️ Antitrava', desc: 'Messaggi crash/lunghi' },
    { key: 'antiviewonce', name: '👁️ Antiviewonce', desc: 'Rivela messaggi "una volta"' },
    { key: 'antiporn', name: '🔞 Antiporno', desc: 'Filtro contenuti espliciti' },
    { key: 'antivoip', name: '📞 Antivoip', desc: 'Blocca chiamate in entrata' }
  ];

  const ownerFeatures = [
    { key: 'antiprivato', name: '🔒 Antiprivato', desc: 'Blocca DM' },
    { key: 'soloCreatore', name: '👑 Solocreatore', desc: 'Solo owner mode' },
    { key: 'jadibotmd', name: '🧬 Subbots', desc: 'Gestione sub-account' },
    { key: 'read', name: '👀 Lettura', desc: 'Auto-read messaggi' },
    { key: 'anticall', name: '❌📞 Antichiamate', desc: 'Rifiuto chiamate globale' }
  ];

  // Invio del Menu Selezione
  if (!args.length) {
    let sections = [
      {
        title: "💠 SEZIONE AMMINISTRAZIONE",
        rows: adminFeatures.map(f => ({
          title: f.name,
          description: `Stato: [ ON/OFF ] - ${f.desc}`,
          id: `${usedPrefix}${isEnable ? 'attiva' : 'attiva'} ${f.key}` 
        }))
      },
      {
        title: "🛡️ SEZIONE SICUREZZA",
        rows: securityFeatures.map(f => ({
          title: f.name,
          description: f.desc,
          id: `${usedPrefix}attiva ${f.key}`
        }))
      }
    ];

    if (isOwner || isROwner) {
      sections.push({
        title: "👑 SEZIONE OWNER",
        rows: ownerFeatures.map(f => ({
          title: f.name,
          description: f.desc,
          id: `${usedPrefix}attiva ${f.key}`
        }))
      });
    }

    const listMessage = {
      text: `┏━━━━━━━━━━━━━━━━┓\n   💠 *B L D  -  B O T* 💠\n┗━━━━━━━━━━━━━━━━┛\n\n*Ciao ${userName}!*\nSeleziona una funzione dal menu sottostante per attivarla o disattivarla nel sistema.\n\n_Usa il tasto qui sotto_ 👇`,
      footer: "Pannello di controllo centrale BloodBot",
      buttonText: "⚙️ CONFIGURA SISTEMA",
      sections,
      contextInfo: dynamicContextInfo
    };

    return conn.sendMessage(m.chat, listMessage, { quoted: m });
  }

  // --- LOGICA DI ELABORAZIONE COMANDI (ATTIVA/DISATTIVA) ---
  let results = [];
  for (let type of args.map(arg => arg.toLowerCase())) {
    let result = { type, status: '', success: false };

    switch (type) {
      case 'welcome':
      case 'goodbye':
      case 'rileva':
      case 'modoadmin':
      case 'ai':
      case 'vocali':
      case 'reaction':
      case 'autolevelup':
      case 'antispam':
      case 'antibot':
      case 'antitrava':
      case 'antinuke':
      case 'antivoip':
      case 'antilink':
      case 'antiLink2':
      case 'antioneview':
      case 'antiviewonce':
      case 'antiporn':
        if (!m.isGroup && !isOwner) { result.status = '❌ Solo nei gruppi'; break; }
        if (m.isGroup && !isAdmin && !isOwner) { result.status = '🛡️ Solo per Admin'; break; }
        
        let settingKey = type === 'antiviewonce' ? 'antioneview' : type;
        if (chat[settingKey] === isEnable) {
          result.status = `⚠️ Già ${isEnable ? 'attivo' : 'spento'}`;
        } else {
          chat[settingKey] = isEnable;
          result.status = `✅ ${isEnable ? 'Attivato' : 'Disattivato'}`;
          result.success = true;
        }
        break;

      case 'antiprivato':
      case 'solocreatore':
      case 'anticall':
      case 'read':
      case 'jadibotmd':
        if (!isOwner) { result.status = '👑 Solo Owner'; break; }
        if (bot[type] === isEnable) {
          result.status = `⚠️ Già ${isEnable ? 'attivo' : 'spento'}`;
        } else {
          bot[type] = isEnable;
          result.status = `✅ ${isEnable ? 'Attivato' : 'Disattivato'}`;
          result.success = true;
        }
        break;

      default:
        result.status = '❓ Comando ignoto';
    }
    results.push(result);
  }

  let summary = `『 ⚙️ 』 *LOG OPERAZIONI:*\n\n` + results.map(r => `• *${r.type}*: ${r.status}`).join('\n');
  await conn.sendMessage(m.chat, { text: summary }, { quoted: m });
};

handler.help = ['attiva', 'disattiva'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'];

export default handler;
