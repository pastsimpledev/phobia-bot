import fetch from 'node-fetch'
import { createCanvas, loadImage } from 'canvas'

// Funzione per disegnare il cuore (usata in I Love)
function drawHeart(ctx, x, y, width, height) {
    const topCurveHeight = height * 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height);
    ctx.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
}

// Generatore immagine "I LOVE NAME"
async function createILoveImage(name) {
    const width = 1080;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    const fontFace = 'sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const firstLineY = height * 0.35;
    const heartSize = 350;
    ctx.fillStyle = 'black';
    ctx.font = `bold 300px ${fontFace}`;
    const iWidth = ctx.measureText('I').width;
    const iX = width / 2 - iWidth / 2 - heartSize / 1.5;
    ctx.fillText('I', iX, firstLineY);
    const heartX = iX + iWidth + heartSize / 1.5;
    const heartY = firstLineY - heartSize / 2;
    drawHeart(ctx, heartX, heartY, heartSize, heartSize);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.fillStyle = 'black';
    let fontSize = 280;
    ctx.font = `bold ${fontSize}px ${fontFace}`;
    const maxTextWidth = width * 0.9;
    while (ctx.measureText(name.toUpperCase()).width > maxTextWidth && fontSize > 40) {
        fontSize -= 10;
        ctx.font = `bold ${fontSize}px ${fontFace}`;
    }
    ctx.fillText(name.toUpperCase(), width / 2, height * 0.75);
    return canvas.toBuffer('image/jpeg');
}

// Funzione principale per applicare gli effetti (Gay, Trans, Sborra)
const applicaEffetto = async (m, conn, tipoEffetto, usedPrefix, command) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid?.[0] ? m.mentionedJid[0] : m.sender
    
    try {
        let bufferImmagine
        // 1. Gestione Immagine Quotata
        if (m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.mtype === 'viewOnceMessage')) {
            bufferImmagine = await m.quoted.download()
        } 
        // 2. Gestione Foto Profilo
        else {
            let pp = await conn.profilePictureUrl(who, 'image').catch(() => null)
            if (!pp) return m.reply('❌ L\'utente non ha una foto profilo pubblica o l\'immagine non è accessibile.')
            let res = await fetch(pp)
            bufferImmagine = await res.arrayBuffer()
        }

        if (!bufferImmagine) throw new Error('Errore nel recupero dell\'immagine.')

        let nomeUtente = await conn.getName(who)
        // Passiamo tipoEffetto per decidere quale rendering usare
        let bufferFinale = await applicaEffettiCanvas(bufferImmagine, tipoEffetto)
        
        const messaggi = { 
            gay: [`${nomeUtente} è diventato gay! 🏳️‍🌈`],
            trans: [`${nomeUtente} ha cambiato genere! 🏳️‍⚧️`],
            sborra: [`${nomeUtente} è stato ricoperto di... gloria. 💦`]
        }
        
        let msg = messaggi[tipoEffetto][Math.floor(Math.random() * messaggi[tipoEffetto].length)]
        await conn.sendFile(m.chat, bufferFinale, 'effetto.jpg', `*\`${msg}\`*`, m, false, { mentions: [who] })
        
    } catch (e) {
        console.error(e)
        m.reply('❌ Si è verificato un errore nel processare l\'immagine.')
    }
}

// Rendering Canvas per gli effetti
async function applicaEffettiCanvas(buffer, tipo) {
    let img = await loadImage(Buffer.from(buffer))
    let canvas = createCanvas(img.width, img.height)
    let ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    if (tipo === 'sborra') {
        // --- NUOVO EFFETTO MIGLIORATO ---
        // Numero di schizzi principali basato sulla dimensione dell'immagine
        let numMainSplats = 10 + Math.floor(Math.random() * 8);
        
        for (let i = 0; i < numMainSplats; i++) {
            let x = Math.random() * img.width;
            let y = Math.random() * img.height;
            // Dimensione base dinamica
            let baseSize = (img.width * 0.04) + Math.random() * (img.width * 0.03);
            
            disegnaSborraRealistica(ctx, x, y, baseSize);
        }
    } else {
        // Effetti Pride (Overlay colorato - invariato)
        const pride = {
            gay: ['#E40303', '#FF8C00', '#FFED00', '#008563', '#409CFF', '#955ABE'],
            trans: ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA']
        }
        let colors = pride[tipo]
        ctx.globalAlpha = 0.4
        let grad = ctx.createLinearGradient(0, 0, 0, img.height)
        colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c))
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, img.width, img.height)
    }
    return canvas.toBuffer('image/jpeg')
}

// --- FUNZIONE DI RENDERING AVANZATO ---
function disegnaSborraRealistica(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    
    // Ruotiamo leggermente ogni schizzo per casualità
    ctx.rotate(Math.random() * Math.PI * 2);

    // 1. Alone di impatto (Splat basale molto trasparente)
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // 2. Nucleo Viscoso (Goccia principale con gradiente 3D)
    ctx.globalAlpha = 1.0;
    
    // Creiamo una forma irregolare (non un cerchio perfetto)
    ctx.beginPath();
    let nPoints = 8;
    for (let i = 0; i < nPoints; i++) {
        let angle = (i / nPoints) * Math.PI * 2;
        // Irregolarità del raggio
        let randomRadius = size * (0.8 + Math.random() * 0.4);
        let px = Math.cos(angle) * randomRadius;
        let py = Math.sin(angle) * randomRadius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Gradiente radiale per volume lucido
    let grad = ctx.createRadialGradient(-size*0.3, -size*0.3, size*0.1, 0, 0, size);
    grad.addColorStop(0, '#FFFFFF'); // Centro bianco puro lucido
    grad.addColorStop(0.8, '#F0F0F0'); // Bianco perla denso
    grad.addColorStop(1, '#DCDCDC'); // Bordo leggermente grigio (ombra)
    ctx.fillStyle = grad;
    ctx.fill();

    // 3. Micro-gocce satelliti (Schizzi piccoli intorno)
    let nSatellites = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < nSatellites; i++) {
        let ang = Math.random() * Math.PI * 2;
        // Distanza dal centro variabile
        let dist = size * (1.2 + Math.random() * 0.8);
        // Dimensione satellite proporzionale
        let satSize = size * (0.2 + Math.random() * 0.2);
        
        ctx.beginPath();
        // Anche i satelliti hanno forma ellittica irregolare
        ctx.ellipse(Math.cos(ang) * dist, Math.sin(ang) * dist, satSize, satSize * 0.7, ang, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() > 0.5 ? '#FFFFFF' : '#F5F5F5';
        ctx.fill();
    }

    // 4. Colatura Viscosa (Dripping effect)
    // Non tutti gli schizzi colano, 70% di probabilità
    if (Math.random() > 0.3) {
        ctx.restore(); // Resettiamo la rotazione per colare dritto verso il basso
        ctx.save();
        ctx.translate(x, y);

        let dripWidth = size * (0.5 + Math.random() * 0.3);
        let dripLength = size * (2 + Math.random() * 3); // Lunghezza casuale scia
        
        // Disegniamo la scia verticale allargata in fondo
        ctx.beginPath();
        ctx.moveTo(-dripWidth/2, 0);
        // Scia dritta
        ctx.lineTo(-dripWidth/2, dripLength);
        // Base a goccia curva
        ctx.bezierCurveTo(-dripWidth/2, dripLength + dripWidth, dripWidth/2, dripLength + dripWidth, dripWidth/2, dripLength);
        ctx.lineTo(dripWidth/2, 0);
        ctx.closePath();
        
        // Stesso gradiente lucido del nucleo
        let dripGrad = ctx.createLinearGradient(0, 0, 0, dripLength + dripWidth);
        dripGrad.addColorStop(0, '#FFFFFF');
        dripGrad.addColorStop(1, '#E0E0E0');
        ctx.fillStyle = dripGrad;
        ctx.fill();
    }

    ctx.restore();
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const cmd = command.toLowerCase()
    if (cmd === 'il' || cmd === 'ilove') {
        let name = m.mentionedJid?.[0] ? await conn.getName(m.mentionedJid[0]) : text
        if (!name) return m.reply(`Esempio: ${usedPrefix + command} Nome`)
        let buf = await createILoveImage(name)
        await conn.sendFile(m.chat, buf, 'love.jpg', '', m)
    } else {
        await applicaEffetto(m, conn, cmd, usedPrefix, command)
    }
}

handler.command = /^(gay|trans|sborra|il|ilove)$/i
export default handler
