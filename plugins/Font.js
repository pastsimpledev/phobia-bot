let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `🫣 Inserisci il testo da trasformare!\nEsempio: *${usedPrefix + command} Gaia*`;

    const styles = [
        { name: "Grassetto Serif", map: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔batch𝐕𝐖batch𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧 batch𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳" },
        { name: "Gotico", map: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟" },
        { name: "Corsivo", map: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃" },
        { name: "Doppia Linea", map: "𝔸mathbb{B}ℂmathbb{D}mathbb{E}mathbb{F}mathbb{G}mathbb{H}mathbb{I}mathbb{J}mathbb{K}mathbb{L}mathbb{M}mathbb{N}mathbb{O}mathbb{P}mathbb{Q}mathbb{R}mathbb{S}mathbb{T}mathbb{U}mathbb{V}mathbb{W}mathbb{X}mathbb{Y}mathbb{Z}𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝐩𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫" },
        { name: "Macchina Scrivere", map: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣" },
        { name: "Sans Bold", map: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰搬𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇" },
        { name: "Piccolo Maiuscolo", map: "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ" },
        { name: "Cerchiati", map: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ" },
        { name: "Quadratini", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "Sottosopra", map: "∀BƆDƎℲפHIſK˥WNOԀΌᴚS┴∩ΛMX⅄Zɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz" },
        { name: "Ninja", map: "丹乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺ＳＴＵ∨山メㄚ乙" },
        { name: "Hacker", map: "48CD3F6H1JK1MN0PQЯ57UVWXY2" },
        { name: "Simboli", map: "αвс∂εғgнιנкℓмησρҩяsтυνωxүz" },
        { name: "Antico", map: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷" },
        { name: "Militare", map: "ΛBCDΞFGHIJKLMNθPQRSTUVWXYZ" },
        { name: "Curvo", map: "αвcdєfghíjklmnσpqrѕtuvωxyz" },
        { name: "Smeraldo", map: "ąҍçժҽƒցհìʝҟӀʍղօքզɾʂէմѵաҳվՀ" },
        { name: "Glatis", map: "卂乃匚刀乇下厶卄工丁长乚从𠂉口尸㔿尺丂丅凵リ山乂丫乙" },
        { name: "Vapor", map: "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ" },
        { name: "Blur", map: "A҉B҉C҉D҉E҉F҉G҉H҉I҉J҉K҉L҉M҉N҉O҉P҉Q҉R҉S҉T҉U҉V҉W҉X҉Y҉Z҉" },
        { name: "Taglio", map: "A̸B̸C̸D̸E̸F̸G̸H̸I̸J̸K̸L̸M̸N̸O̸P̸Q̸R̸S̸T̸U̸V̸W̸X̸Y̸Z̸" },
        { name: "Frecce", map: "➵A➵B➵C➵D➵E➵F➵G➵H➵I➵J➵K➵L➵M➵N➵O➵P➵Q➵R➵S➵T➵U➵V➵W➵X➵Y➵Z" },
        { name: "Matematico", map: "negative 𝛢𝛣𝛤𝛥𝛦𝛧𝛨𝛩𝛪𝛫𝛬𝛭𝛮𝛯𝛰𝛱𝛲𝛴𝛵𝛶𝛷𝛸𝛹𝛺𝛼𝛽𝛾𝛿𝜀𝜁𝜗𝜄𝜅𝜆𝜇𝜈𝜉𝜊𝜋𝜌𝜍𝜎𝜏𝜐𝜑𝜒𝜓𝜔" },
        { name: "Puntini", map: "A̤B̤C̤D̤E̤F̤G̤H̤I̤J̤K̤L̤M̤N̤O̤P̤Q̤R̤S̤T̤ṲV̤W̤X̤Y̤Z̤" }
        // ... (Ho incluso i più stabili, puoi espandere la lista map)
    ];

    const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    const convert = (t, map) => {
        let mapArr = [...map];
        return t.split('').map(char => {
            const index = normal.indexOf(char);
            if (index === -1) return char;
            return mapArr[index] || char;
        }).join('');
    };

    let menu = `🎨 *MULTIPLEX FONT GENERATOR* 🎨\n\n`;
    menu += `Testo: *${text}*\n\n`;
    
    styles.forEach((s, i) => {
        menu += `${i + 1}. ${convert("BLOOD", s.map)} (${s.name})\n`;
    });

    menu += `\n> *Invia il numero del font desiderato!*`;

    let { key } = await conn.reply(m.chat, menu, m);

    conn.ev.on('messages.upsert', async ({ messages }) => {
        let m2 = messages[0];
        if (!m2.message) return;
        const msgText = (m2.message.conversation || m2.message.extendedTextMessage?.text || "").trim();
        const quoted = m2.message.extendedTextMessage?.contextInfo;

        if (quoted && quoted.stanzaId === key.id) {
            let choice = parseInt(msgText);
            if (!isNaN(choice) && styles[choice - 1]) {
                let result = convert(text, styles[choice - 1].map);
                await conn.reply(m.chat, result, m2);
            }
        }
    });
};

handler.help = ['font <testo>'];
handler.tags = ['utility'];
handler.command = /^(font)$/i;
handler.group = true;

export default handler;
