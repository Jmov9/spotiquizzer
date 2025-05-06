const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

// Satunnainen hakusana esim. aakkosista
const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26));

fetch(`https://api.deezer.com/search?q=${randomLetter}&limit=20&output=jsonp`, {
  method: 'GET'
})
  .then(response => response.text())
  .then(raw => {
    const json = JSON.parse(raw.substring(raw.indexOf('(') + 1, raw.lastIndexOf(')'))); // JSONP purku
    const tracks = json.data.filter(t => t.preview); // Vain ne joilla on preview

    if (tracks.length < 4) throw new Error("Liian vähän esikuunneltavia kappaleita");

    const correct = tracks[Math.floor(Math.random() * tracks.length)];
    const choices = shuffle([...tracks].slice(0, 4));
    if (!choices.includes(correct)) {
      choices[Math.floor(Math.random() * 4)] = correct;
    }

    audio.src = correct.preview;

    choices.forEach(track => {
      const btn = document.createElement('button');
      btn.innerText = `${track.title} – ${track.artist.name}`;
      btn.onclick = () => {
        if (track.id === correct.id) {
          result.innerText = "✅ Oikein!";
        } else {
          result.innerText = `❌ Väärin! Oikea oli: ${correct.title} – ${correct.artist.name}`;
        }
      };
      optionsDiv.appendChild(btn);
    });
  })
  .catch(err => {
    console.error("❌ Virhe:", err);
    result.innerText = "⚠️ Virhe: " + err.message;
  });

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
