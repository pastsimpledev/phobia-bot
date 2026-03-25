let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*🫣 Inserisci il testo da trasformare!*\n\nEsempio: _${usedPrefix + command} Ciao_`;

    const styles = [
        { name: "Grassetto Serif", map: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳" },
        { name: "Gotico Moderno", map: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚\uD835\uDDBE\uD835\uDDBF\uD835\uDDC0\uD835\uDDC1\uD835\uDDC2" },
        { name: "Corsivo Elegante", map: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪\uD835\uDCB7\uD835\uDCB8\uD835\uDCB9\uD835\uDCC4\uD835\uDCC5\uD835\uDCC6\uD835\uDCC7\uD835\uDCC8\uD835\uDCC9\uD835\uDCCA\uD835\uDCCB\uD835\uDCCC\uD835\uDCCD\uD835\uDCCE\uD835\uDCCF\uD835\uDCD0\uD835\uDCD1\uD835\uDCD2\uD835\uDCD3\uD835\uDCD4\uD835\uDCD5\uD835\uDCD6\uD835\uDCD7\uD835\uDCD8\uD835\uDCD9" },
        { name: "Doppia Linea", map: "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫" },
        { name: "Macchina da Scrivere", map: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣" },
        { name: "Gotico Antico", map: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝𝔞𝔟𝔠\uD835\uDD21\uD835\uDD22\uD835\uDD23\uD835\uDD24\uD835\uDD25\uD835\uDD26\uD835\uDD27\uD835\uDD28\uD835\uDD29\uD835\uDD2A\uD835\uDD2B\uD835\uDD2C\uD835\uDD2D\uD835\uDD2E\uD835\uDD2F\uD835\uDD30\uD835\uDD31\uD835\uDD32\uD835\uDD33\uD835\uDD34\uD835\uDD35\uD835\uDD36\uD835\uDD37" },
        { name: "Sans Grassetto", map: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇" },
        { name: "Sans Corsivo", map: "𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯" },
        { name: "Piccolo Maiuscolo", map: "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ" },
        { name: "Cerchiati", map: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ" },
        { name: "Cerchiati Neri", map: "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩" },
        { name: "Quadratini", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "Vaporwave", map: "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ" },
        { name: "Sottosopra", map: "∀BƆDƎℲפHIſK˥WNOԀΌᴚS┴∩ΛMX⅄Zɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz" },
        { name: "Giapponese", map: "ﾑ乃ᄃり乇ｷgんﾉﾌズﾚ Create乃刀のｱゐ尺丂ｲひ√Wﾒﾘ乙ﾑ乃ᄃり乇ｷgんﾉﾌズﾚ Create乃刀のｱゐ尺丂ｲひ√Wﾒﾘ乙" },
        { name: "Hacker", map: "48CD3F6H1JK1MN0PQЯ57UVWXY248cd3f6h1jk1mn0pqя57uvwxy2" },
        { name: "Curvy", map: "ค๒ς๔єŦﻮђเןкɭ๓ภ๏קợгรՇยงฬאץչค๒ς๔єŦﻮђเןкɭ๓ภ๏קợгรՇยงฬאץչ" },
        { name: "Neon", map: "ᗩᗷᑕᗪEᖴGᕼIᒍKᒪMᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭YᘔᗩᗷᑕᗪEᖴGᕼIᒍKᒪMᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ" },
        { name: "Monospace", map: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅\uD835\uDDB0\uD835\uDDB1\uD835\uDDB2\uD835\uDDB3\uD835\uDDB4\uD835\uDDB5\uD835\uDDB6\uD835\uDDB7\uD835\uDDB8\uD835\uDDB9\uD835\uDDBA\uD835\uDDBB\uD835\uDDBC\uD835\uDDBD\uD835\uDDBE\uD835\uDDBF" },
        { name: "Blurry", map: "A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Za̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z" }
    ];

    const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    const convert = (t, map) => {
        const mapArr = Array.from(map);
        return t.split('').map(char => {
            const index = normal.indexOf(char);
            // Se il carattere è in 'normal', prendi il corrispondente dalla mappa, altrimenti lascia invariato
            return index > -1 && mapArr[index] ? mapArr[index] : char;
        }).join('');
    };

    let menu = `✨ *OFFICINA CARATTERI* ✨\n\n`;
    menu += `Testo: *${text}*\n\n`;
    
    styles.forEach((s, i) => {
        menu += `${i + 1}. ${convert("BLOOD", s.map)} (${s.name})\n`;
    });

    menu += `\n> *Rispondi col numero per trasformare "${text}"*`;

    let { key } = await conn.reply(m.chat, menu, m);

    conn.ev.on('messages.upsert', async function handlerFont(upsert) {
        let m2 = upsert.messages[0];
        if (!m2.message) return;
        const msgText = m2.message.conversation || m2.message.extendedTextMessage?.text;
        const quoted = m2.message.extendedTextMessage?.contextInfo;

        if (quoted && quoted.stanzaId === key.id) {
            let choice = parseInt(msgText?.trim());
            if (!isNaN(choice) && styles[choice - 1]) {
                let result = convert(text, styles[choice - 1].map);
                await conn.reply(m.chat, result, m2);
                conn.ev.off('messages.upsert', handlerFont); // Spegni dopo l'uso
            }
        }
    });
};

handler.help = ['font <testo>'];
handler.tags = ['utility'];
handler.command = /^(font)$/i;
handler.group = true;

export default handler;
