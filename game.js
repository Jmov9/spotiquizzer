const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

// Pelitilan valinta
function startSolo() {
  localStorage.setItem('mode', 'solo');
  document.getElementById('setup').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  startGame();
}

function showPartySetup() {
  document.getElementById('party-setup').style.display = 'block';
}

function addPlayerInput() {
  const container = document.getElementById('player-inputs');
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = `Pelaaja ${container.children.length + 1}`;
  container.appendChild(input);
}

function startParty() {
  const names = [...document.querySelectorAll('#player-inputs input')]
    .map(i => i.value.trim()).filter(Boolean);

  if (names.length < 2) {
    alert('Anna vähintään kaksi nimeä!');
    return;
  }

  localStorage.setItem('mode', 'party');
  localStorage.setItem('players', JSON.stringify(names));
  localStorage.setItem('currentPlayer', '0');

  document.getElementById('setup').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  startGame();
}

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

let allTracks = [];
let queriesDone = 0;

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
        result.innerText = `❌ Väärin! Oikea oli: ${correct.title} – ${track.artist.name}`;
      }
    };
    optionsDiv.appendChild(btn);
  });
}

function startGame() {
  // Tyhjennetään vanhat
  optionsDiv.innerHTML = '';
  result.innerText = '';
  audio.src = '';

  allTracks = [];
  queriesDone = 0;

  const genres = ['rap', 'pop', 'rock', 'house'];
  const searchTerms = [];

  while (searchTerms.length < 4) {
    const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    const genre = genres[Math.floor(Math.random() * genres.length)];
    searchTerms.push(`${genre} ${randomLetter}`);
  }

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
}
