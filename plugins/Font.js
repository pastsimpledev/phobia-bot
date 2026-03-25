let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `🫣 Inserisci il testo!\nEsempio: *${usedPrefix + command} Gaia*`;

    const styles = [
        { name: "Bold", map: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔batch𝐕𝐖batch𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤batch𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳" },
        { name: "Gothic", map: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒batch𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟" },
        { name: "Script", map: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶 batch𝓷 batch𝓸 batch𝒑 batch𝒒 batch𝓻 batch𝓼 batch𝓽 batch𝓾 batch𝓿 batch𝔀 batch𝔁 batch𝔂 batch𝔃" },
        { name: "Double", map: "𝔸mathbb{B}ℂmathbb{D}mathbb{E}mathbb{F}mathbb{G}mathbb{H}mathbb{I}mathbb{J}mathbb{K}mathbb{L}mathbb{M}mathbb{N}mathbb{O}mathbb{P}mathbb{Q}mathbb{R}mathbb{S}mathbb{T}mathbb{U}mathbb{V}mathbb{W}mathbb{X}mathbb{Y}mathbb{Z}𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝐩𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫" },
        { name: "Mono", map: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅batch𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒 batch𝚓 batch𝚔 batch𝚕 batch𝚖 batch𝚗 batch𝚘 batch𝚙 batch𝚚 batch𝚛 batch𝚜 batch𝚝 batch𝚞 batch𝚟 batch𝚠 batch𝚡 batch𝚢 batch𝚣" },
        { name: "Sans Bold", map: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞 batch𝗟 batch𝗠 batch𝗡 batch𝗢 batch𝗣 batch𝗤 batch𝗥 batch𝗦 batch𝗧 batch𝗨 batch𝗩 batch𝗪 batch𝗫 batch𝗬 batch𝗭 batch𝗮 batch𝗯 batch𝗰 batch𝗱 batch𝗲 batch𝗳 batch𝗴 batch𝗵 batch𝗶 batch𝐣 batch𝗸 batch𝗹 batch𝗺 batch𝗻 batch𝗼 batch𝗽 batch𝗾 batch𝗿 batch𝘀 batch𝘁 batch𝘂 batch𝘃 batch𝘄 batch𝘅 batch𝘆 batch𝘇" },
        { name: "SmallCaps", map: "ᴀʙᴄᴅᴇғɢʜɪᴊ batchᴋ batchʟ batchᴍ batch batch batchɴ batchᴏ batchᴘ batchǫ batchʀ batchs batchᴛ batchᴜ batch batchᴠ batchᴡ batchx batchʏ batchᴢ" },
        { name: "Ninja", map: "丹乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺ＳＴＵ∨山メㄚ乙丹乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺ＳＴＵ∨山メㄚ乙" },
        { name: "Hacker", map: "48CD3F6H1JK1MN0PQЯ57UVWXY248cd3f6h1jk1mn0pqя57uvwxy2" },
        { name: "Circles", map: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ" },
        { name: "BlackCircles", map: "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩" },
        { name: "Squares", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "BlackSquares", map: "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅚🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅚🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉" },
        { name: "Greek", map: "αвс∂єƒgнιјκℓмиορφяѕτυνωϰуζαвс∂єƒgнιјκℓмиορφяѕτυνωϰуζ" },
        { name: "Antico", map: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷" },
        { name: "Vapor", map: "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ" },
        { name: "UpsideDown", map: "∀BƆDƎℲפHIſK˥WNOԀΌᴚS┴∩ΛMX⅄Zɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz" },
        { name: "Mirror", map: "AdCdEɟGHIJKLMИOԀQЯƧTUVWXYZɐqdɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz" },
        { name: "Slash", map: "A̸B̸C̸D̸E̸F̸G̸H̸I̸J̸K̸L̸M̸N̸O̸P̸Q̸R̸S̸T̸U̸V̸W̸X̸Y̸Z̸a̸b̸c̸d̸e̸f̸g̸h̸i̸j̸k̸l̸m̸n̸o̸p̸q̸r̸s̸t̸u̸v̸w̸x̸y̸z̸" },
        { name: "Underline", map: "A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Z̲a̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z̲" },
        { name: "Dotted", map: "A̤B̤C̤D̤E̤F̤G̤H̤I̤J̤K̤L̤M̤N̤O̤P̤Q̤R̤S̤T̲ṲV̤W̤X̤Y̤Z̤a̤b̤c̤d̤e̤f̤g̤h̤i̤j̤k̤l̤m̤n̤o̤p̤q̤r̤s̤t̤ṳv̤w̤x̤y̤z̤" },
        { name: "Currency", map: "₳฿₵ĐɆ₣₲Ⱨł J₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ" },
        { name: "ChineseFake", map: "ﾑ乃cd乇ｷgんﾉﾌズﾚm刀のｱq尺丂ｲu√wﾒﾘ乙" },
        { name: "CursiveBold", map: "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸 R S T U V W X Y Z a b c d e f g h i j k l m n o p q r s t u v w x y z" },
        { name: "Glatis", map: "卂乃匚刀乇下厶卄工丁长乚从𠂉口尸㔿尺丂丅凵リ山乂丫乙" },
        { name: "Militare", map: "ΛBCDΞFGHIJKLMNθPQRSTUVWXYZ" },
        { name: "Archi", map: "A⌒B⌒C⌒D⌒E⌒F⌒G⌒H⌒I⌒J⌒K⌒L⌒M⌒N⌒O⌒P⌒Q⌒R⌒S⌒T⌒U⌒V⌒W⌒X⌒Y⌒Z⌒" },
        { name: "Bubbles", map: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ" },
        { name: "Stretto", map: "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ" },
        { name: "Math", map: "𝛢𝛣𝛤𝛥𝛦𝛧𝛨𝛩𝛪𝛫𝛬𝛭𝛮𝛯𝛰𝛱𝛲𝛴𝛵𝛶𝛷𝛸𝛹𝛺" },
        { name: "Shadow", map: "𝔸𝔹ℂmathbb{D}mathbb{E}mathbb{F}mathbb{G}mathbb{H}mathbb{I}mathbb{J}mathbb{K}mathbb{L}mathbb{M}mathbb{N}mathbb{O}mathbb{P}mathbb{Q}mathbb{R}mathbb{S}mathbb{T}mathbb{U}mathbb{V}mathbb{W}mathbb{X}mathbb{Y}mathbb{Z}" },
        { name: "BlackSquare2", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "Magic", map: "🔮A🔮B🔮C🔮D🔮E🔮F🔮G🔮H🔮I🔮J🔮K🔮L🔮M🔮N🔮O🔮P🔮Q🔮R🔮S🔮T🔮" }, // Placeholder
        { name: "HeavyBold", map: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭" },
        { name: "Thin", map: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉" },
        { name: "Script2", map: "𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵" },
        { name: "Fumetto", map: "A⃠B⃠C⃠D⃠E⃠F⃠G⃠H⃠I⃠J⃠K⃠L⃠M⃠N⃠O⃠P⃠Q⃠R⃠S⃠T⃠U⃠V⃠W⃠X⃠Y⃠Z⃠" },
        { name: "Wavy", map: "A̴B̴C̴D̴E̴F̴G̴H̴I̴J̴K̴L̴M̴N̴O̴P̴Q̴R̴S̴T̴U̴V̴W̴X̴Y̴Z̴" },
        { name: "Blur", map: "A҉B҉C҉D҉E҉F҉G҉H҉I҉J҉K҉L҉M҉N҉O҉P҉Q҉R҉S҉T҉U҉V҉W҉X҉Y҉Z҉" },
        { name: "OldEnglish", map: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷" },
        { name: "RussianFake", map: "ДБCФΞҒGНІЈКLМиОРQЯЅТЦVШХЧZ" },
        { name: "Math2", map: "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁" },
        { name: "Boxed", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "Gothic2", map: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝" },
        { name: "SerifBold", map: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔batch𝐕𝐖batch" },
        { name: "Slanted", map: "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡" },
        { name: "Stile2", map: "𝔸mathbb{B}ℂmathbb{D}mathbb{E}mathbb{F}mathbb{G}mathbb{H}mathbb{I}mathbb{J}mathbb{K}mathbb{L}mathbb{M}mathbb{N}mathbb{O}mathbb{P}mathbb{Q}mathbb{R}mathbb{S}mathbb{T}mathbb{U}mathbb{V}mathbb{W}mathbb{X}mathbb{Y}mathbb{Z}" },
        { name: "Sottolineato2", map: "A̳B̳C̳D̳E̳F̳G̳H̳I̳J̳K̳L̳M̳N̳O̳P̳Q̳R̳S̳T̳U̳V̳W̳X̳Y̳Z̳" },
        { name: "Sopra", map: "A̅B̅C̅D̅E̅F̅G̅H̅I̅J̅K̅L̅M̅N̅O̅P̅Q̅R̅S̅T̅U̅V̅W̅X̅Y̅Z̅" },
        { name: "Decor", map: "A̽B̽C̽D̽E̽F̽G̽H̽I̽J̽K̽L̽M̽N̽O̽P̽Q̽R̽S̽T̽U̽V̽W̽X̽Y̽Z̽" }
    ];

    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    const transform = (str, map) => {
        let res = "";
        let mapArr = [...map];
        for (let char of str) {
            let index = alpha.indexOf(char);
            if (index !== -1) {
                res += mapArr[index] || char;
            } else {
                res += char;
            }
        }
        return res;
    };

    let menu = `🎨 *ELENCO COMPLETO FONT (50 STILI)* 🎨\n\n`;
    menu += `Testo scelto: *${text}*\n\n`;
    
    styles.forEach((s, i) => {
        menu += `${i + 1}. ${transform("BLOOD", s.map)} (${s.name})\n`;
    });

    menu += `\n> *Rispondi con il numero per trasformare "${text}"*`;

    // WhatsApp ha un limite di 4096 caratteri, 50 font ci stanno se il menu è pulito
    let { key } = await conn.reply(m.chat, menu, m);

    conn.beforeReply = async (m2) => {
        if (!m2.quoted || m2.quoted.id !== key.id) return;
        let choice = parseInt(m2.text.trim());
        if (!isNaN(choice) && styles[choice - 1]) {
            let result = transform(text, styles[choice - 1].map);
            await conn.reply(m.chat, result, m2);
            delete conn.beforeReply;
        }
    };
};

handler.help = ['font <testo>'];
handler.tags = ['utility'];
handler.command = /^(font)$/i;
handler.group = true;

export default handler;
