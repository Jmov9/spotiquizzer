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
  script.src = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10&output=jsonp&callback=${callbackName}`;
  document.body.appendChild(script);
}

// 🔤 Satunnaisia hakuja useista genreistä
const genres = ['rap', 'pop', 'rock', 'house'];
const searchTerms = [];
while (searchTerms.length < 4) {
  const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  const genre = genres[Math.floor(Math.random() * genres.length)];
  searchTerms.push(`${genre} ${randomLetter}`);
}

let allTracks = [];

function proceedIfReady() {
  const validTracks = allTracks.filter(t => t.preview);
  if (validTracks.length < 4) {
    result.innerText = "⚠️ Ei löytynyt tarpeeksi esikuunneltavia kappaleita.";
    return;
  }

  const correct = validTracks[Math.floor(Math.random() * validTracks.length)];
  const choices = shuffle([...validTracks].slice(0, 4));
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
}

// 🔁 Haetaan biisejä eri hauilla
let queriesDone = 0;
searchTerms.forEach(term => {
  fetchDeezerData(term, (json) => {
    if (json.data) {
      allTracks.push(...json.data);
    }
    queriesDone++;
    if (queriesDone === searchTerms.length) {
      proceedIfReady();
    }
  });
});
