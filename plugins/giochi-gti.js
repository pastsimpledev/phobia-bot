function disegnaGoccia(ctx, x, y, dimensione, colori) {
    ctx.save();
    ctx.translate(x, y);

    // Rotazione casuale verso il basso per simulare gravità/spruzzo
    let rotazione = (Math.random() - 0.5) * 0.5; 
    ctx.rotate(rotazione);

    // --- 1. ALONE DI SFONDO (Splat) ---
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        let angolo = (i / 8) * Math.PI * 2;
        let dist = dimensione * (0.8 + Math.random() * 0.4);
        let px = Math.cos(angolo) * dist;
        let py = Math.sin(angolo) * dist;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // --- 2. CORPO PRINCIPALE (Goccia/Nucleo) ---
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    // Forma a goccia distorta
    ctx.moveTo(0, -dimensione);
    ctx.bezierCurveTo(
        dimensione * 0.8, -dimensione * 0.5, 
        dimensione * 1.2, dimensione, 
        0, dimensione * 1.1
    );
    ctx.bezierCurveTo(
        -dimensione * 1.2, dimensione, 
        -dimensione * 0.8, -dimensione * 0.5, 
        0, -dimensione
    );
    
    let gradienteGoccia = ctx.createRadialGradient(-dimensione*0.2, -dimensione*0.2, 0, 0, 0, dimensione);
    gradienteGoccia.addColorStop(0, '#FFFFFF'); // Centro bianco puro
    gradienteGoccia.addColorStop(0.7, '#F0F0F0'); // Grigio chiarissimo
    gradienteGoccia.addColorStop(1, '#D1D1D1'); // Ombra leggera ai bordi
    
    ctx.fillStyle = gradienteGoccia;
    ctx.fill();

    // --- 3. RIFLESSI DI LUCE (Glossy) ---
    ctx.beginPath();
    ctx.ellipse(-dimensione * 0.3, -dimensione * 0.4, dimensione * 0.2, dimensione * 0.4, Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();

    // --- 4. MICRO-SCHIZZI SATELLITE ---
    for (let i = 0; i < 12; i++) {
        let angolo = Math.random() * Math.PI * 2;
        let distanza = dimensione * (1.2 + Math.random() * 1.5);
        let sX = Math.cos(angolo) * distanza;
        let sY = Math.sin(angolo) * distanza;
        let raggio = Math.random() * (dimensione * 0.25);

        ctx.beginPath();
        ctx.arc(sX, sY, raggio, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() > 0.5 ? '#FFFFFF' : '#EFEFEF';
        ctx.fill();
        
        // Piccola scia per alcuni satelliti
        if (Math.random() > 0.7) {
            ctx.beginPath();
            ctx.moveTo(sX, sY);
            ctx.lineTo(sX * 1.2, sY * 1.2);
            ctx.lineWidth = raggio * 0.5;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        }
    }

    // --- 5. COLATURE (Dripping) ---
    if (Math.random() > 0.3) {
        ctx.beginPath();
        let lunghezzaCoda = dimensione * (1.5 + Math.random() * 2);
        ctx.moveTo(-dimensione * 0.2, dimensione * 0.8);
        ctx.bezierCurveTo(
            -dimensione * 0.3, dimensione * 1.5, 
            dimensione * 0.3, dimensione * 2, 
            0, lunghezzaCoda
        );
        ctx.lineCap = 'round';
        ctx.lineWidth = dimensione * 0.4;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        
        // Goccia finale sulla colatura
        ctx.beginPath();
        ctx.arc(0, lunghezzaCoda, dimensione * 0.25, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}
