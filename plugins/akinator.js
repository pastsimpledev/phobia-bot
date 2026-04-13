let handler = async (m, { conn, usedPrefix, command, args }) => {
  conn.akinator = conn.akinator ? conn.akinator : {}

  // 1. BLOCCO DI SICUREZZA (ANTI-INTERFERENZA)
  if (conn.akinator[m.chat] && conn.akinator[m.chat].sender !== m.sender) {
    return m.reply(`🧞‍♂️ *Ehilà!* Sto leggendo la mente di @${conn.akinator[m.chat].sender.split('@')[0]}. \nAspetta che finisca o gioca in una chat privata!`)
  }

  // Database Personaggi con pesi reali
  const personaggi = [
    { name: "Cristiano Ronaldo", tags: { reale: 1, maschio: 1, italiano: -1, sport: 1, anime: -1 } },
    { name: "Sfera Ebbasta", tags: { reale: 1, maschio: 1, italiano: 1, cantante: 1, sport: -1 } },
    { name: "Goku", tags: { reale: -1, maschio: 1, anime: 1, sport: 0.5 } },
    { name: "Chiara Ferragni", tags: { reale: 1, femmina: 1, italiano: 1, social: 1 } },
    { name: "Khaby Lame", tags: { reale: 1, maschio: 1, italiano: 1, social: 1, sport: -1 } },
    { name: "Luffy", tags: { reale: -1, maschio: 1, anime: 1, pirata: 1 } }
  ]

  const domande = [
    { q: "Il tuo personaggio esiste realmente?", tag: "reale" },
    { q: "È un maschio?", tag: "maschio" },
    { q: "È italiano?", tag: "italiano" },
    { q: "È un cantante?", tag: "cantante" },
    { q: "È famoso nel mondo dello sport?", tag: "sport" },
    { q: "Viene da un anime o manga?", tag: "anime" },
    { q: "È una stella dei social (TikTok/IG)?", tag: "social" }
  ]

  // Mappatura pesi Akinator Originale
  const risposteAki = {
    "si": 1,
    "no": -1,
    "nonso": 0,
    "probabile": 0.5,
    "probabileno": -0.5
  }

  // GESTIONE ESCI / RESET
  if (args[0] === 'esci' || args[0] === 'stop') {
    if (!conn.akinator[m.chat]) return m.reply("Non c'è nessuna partita attiva.")
    delete conn.akinator[m.chat]
    return m.reply("🧞‍♂️ *PARTITA TERMINATA*\n\nHo smesso di leggere la tua mente. Alla prossima!")
  }

  // 2. LOGICA DI GIOCO
  if (conn.akinator[m.chat]) {
    let gioco = conn.akinator[m.chat]
    let scelta = args[0]?.toLowerCase()

    if (!risposteAki.hasOwnProperty(scelta)) {
      return m.reply("⚠️ Usa i bottoni o scrivi una delle opzioni valide!")
    }

    // Registra risposta e avanza
    let tagCorrente = domande[gioco.step].tag
    gioco.punteggi[tagCorrente] = risposteAki[scelta]
    gioco.step++

    // CONTROLLO FINE GIOCO
    if (gioco.step >= domande.length) {
      let vincitore = personaggi.map(p => {
        let score = 0
        for (let tag in gioco.punteggi) {
          if (p.tags[tag]) score += (p.tags[tag] * gioco.punteggi[tag])
        }
        return { ...p, finalScore: score }
      }).sort((a, b) => b.finalScore - a.finalScore)[0]

      let resultTxt = `✨ *L'HO INDOVINATO!* ✨\n\n`
      resultTxt += `👤 *Personaggio:* ${vincitore.name}\n`
      resultTxt += `🧞‍♂️ *Genio:* Ho letto i tuoi pensieri con successo!\n\n`
      resultTxt += `> Vuoi sfidarmi ancora? Digita ${usedPrefix}${command}`

      delete conn.akinator[m.chat]
      return m.reply(resultTxt)
    }

    // Prossima domanda
    return inviaAkiButtons(conn, m, domande[gioco.step].q, gioco.step + 1, usedPrefix, command)
  }

  // 3. INIZIO PARTITA
  conn.akinator[m.chat] = {
    sender: m.sender,
    step: 0,
    punteggi: {}
  }

  let intro = `🧞‍♂️ *IL GENIO AKINATOR*\n\nPensa a un personaggio famoso. Proverò a indovinare chi è!\n\n*1.* ${domande[0].q}`
  return inviaAkiButtons(conn, m, intro, 1, usedPrefix, command)
}

async function inviaAkiButtons(conn, m, testo, num, usedPrefix, command) {
  // Configurazione Bottoni
  const buttons = [
    { buttonId: `${usedPrefix}${command} si`, buttonText: { displayText: "Sì ✅" }, type: 1 },
    { buttonId: `${usedPrefix}${command} no`, buttonText: { displayText: "No ❌" }, type: 1 },
    { buttonId: `${usedPrefix}${command} nonso`, buttonText: { displayText: "Non so 🤔" }, type: 1 },
    { buttonId: `${usedPrefix}${command} probabile`, buttonText: { displayText: "Probabilmente 👍" }, type: 1 },
    { buttonId: `${usedPrefix}${command} esci`, buttonText: { displayText: "Esci 🏳️" }, type: 1 }
  ]

  // Nota: Se i bottoni non appaiono (limite WA), il testo include i comandi cliccabili
  let extraText = `\n\n*Opzioni:*\n- ${usedPrefix}${command} si\n- ${usedPrefix}${command} no\n- ${usedPrefix}${command} nonso\n- ${usedPrefix}${command} probabile\n- ${usedPrefix}${command} probabileno\n- ${usedPrefix}${command} esci`

  return await conn.sendMessage(m.chat, {
    text: testo + (global.opts['buttons'] ? '' : extraText),
    footer: `Domanda ${num}/7 • Akinator`,
    buttons: buttons,
    headerType: 1,
    viewOnce: true
  }, { quoted: m })
}

handler.help = ['akinator']
handler.tags = ['giochi']
handler.command = /^(akinator|aki)$/i

export default handler
