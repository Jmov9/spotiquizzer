const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function fetchDeezerData(query, callback) {
  const script = document.createElement('script');
  const callbackName = 'deezerCallback_' + Math.floor(Math.random() * 100000);
  window[callbackName] = function (data) {
    callback(data);
    delete window[callbackName];
    script.remove();
  };
  script.src = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=20&output=jsonp&callback=${callbackName}`;
  document.body.appendChild(script);
}

// 🔄 Valitaan satunnainen genre
const genres = ['rap', 'pop', 'rock', 'house'];
const selectedGenre = genres[Math.floor(Math.random() * genres.length)];
console.log("🎧 Valittu genre:", selectedGenre);

fetchDeezerData(selectedGenre, (json) => {
  const tracks = json.data.filter(t => t.preview);

  if (tracks.length < 4) {
    result.innerText = "⚠️ Liian vähän esikuunneltavia kappaleita";
    return;
  }

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
});
