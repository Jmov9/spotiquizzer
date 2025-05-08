const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');
const currentPlayerLabel = document.getElementById('current-player');
const roundSlider = document.getElementById('roundCountInput');
const roundDisplay = document.getElementById('roundCountDisplay');

let players = [];
let currentPlayerIndex = 0;
let answeredThisRound = [];
let currentCorrectTrack = null;
let allTracks = [];
let queriesDone = 0;
let playerScores = {};
let roundsPlayed = 0;
let maxRounds = 10;
let selectedMode = null;

roundSlider.addEventListener('input', () => {
  roundDisplay.innerText = roundSlider.value;
});

function getSelectedRoundCount() {
  return parseInt(roundSlider.value);
}

function selectMode(mode) {
  selectedMode = mode;
  document.getElementById('solo-btn').classList.remove('selected-mode');
  document.getElementById('party-btn').classList.remove('selected-mode');

  if (mode === 'solo') {
    document.getElementById('solo-btn').classList.add('selected-mode');
    document.getElementById('party-setup').style.display = 'none';
  } else {
    document.getElementById('party-btn').classList.add('selected-mode');
    document.getElementById('party-setup').style.display = 'block';
  }
}

function startSelectedMode() {
  if (selectedMode === 'solo') {
    startSolo();
  } else if (selectedMode === 'party') {
    startParty();
  } else {
    alert("Valitse ensin pelitila.");
  }
}

function startSolo() {
  localStorage.setItem('mode', 'solo');
  document.getElementById('setup').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  players = ['solo'];
  playerScores = { solo: 0 };
  roundsPlayed = 0;
  maxRounds = getSelectedRoundCount();
  startGame();
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

  players = names;
  playerScores = {};
  names.forEach(name => playerScores[name] = 0);
  roundsPlayed = 0;
  currentPlayerIndex = 0;
  maxRounds = getSelectedRoundCount();
  localStorage.setItem('mode', 'party');

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

function handleAnswer(selectedTrack) {
  audio.pause();
  document.getElementById('play-logo').classList.remove('playing');
  const isCorrect = selectedTrack.id === currentCorrectTrack.id;
  const name = players[currentPlayerIndex] || 'solo';

  if (isCorrect) {
    playerScores[name]++;
  }

  result.innerText = isCorrect
    ? "Oikein!"
    : `Väärin! Oikea oli: ${currentCorrectTrack.title} – ${currentCorrectTrack.artist.name}`;

  answeredThisRound.push(name);

  if (localStorage.getItem('mode') === 'party') {
    currentPlayerIndex++;
    if (currentPlayerIndex >= players.length) {
      currentPlayerIndex = 0;
      answeredThisRound = [];
      roundsPlayed++;
      if (roundsPlayed >= maxRounds) {
        endGame();
      } else {
        setTimeout(startGame, 1500);
      }
    } else {
      setTimeout(presentQuestion, 1500);
    }
  } else {
    roundsPlayed++;
    if (roundsPlayed >= maxRounds) {
      endGame();
    } else {
      setTimeout(startGame, 1500);
    }
  }
}

function presentQuestion() {
  optionsDiv.innerHTML = '';
  result.innerText = '';

  const validTracks = allTracks.filter(t => t.preview);
  if (validTracks.length < 4) {
    result.innerText = "Ei tarpeeksi esikuunneltavia kappaleita.";
    return;
  }

  if (localStorage.getItem('mode') === 'party') {
    const playerName = players[currentPlayerIndex];
    currentPlayerLabel.innerText = `${playerName}, sinun vuoro!`;
  } else {
    currentPlayerLabel.innerText = '';
  }

  currentCorrectTrack = validTracks[Math.floor(Math.random() * validTracks.length)];
  const choices = shuffle([...validTracks].slice(0, 4));
  if (!choices.includes(currentCorrectTrack)) {
    choices[Math.floor(Math.random() * 4)] = currentCorrectTrack;
  }

  audio.src = currentCorrectTrack.preview;
  document.getElementById('play-logo').classList.remove('playing');

  choices.forEach(track => {
    const btn = document.createElement('button');
    btn.innerText = `${track.title} – ${track.artist.name}`;
    btn.onclick = () => handleAnswer(track);
    optionsDiv.appendChild(btn);
  });
}

function startGame() {
  optionsDiv.innerHTML = '';
  result.innerText = '';
  currentPlayerLabel.innerText = '';
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
        presentQuestion();
      }
    });
  });
}

function togglePlayPause() {
  const logo = document.getElementById('play-logo');

  if (audio.paused) {
    audio.play();
    logo.classList.add('playing');
  } else {
    audio.pause();
    logo.classList.remove('playing');
  }
}

audio.addEventListener('ended', () => {
  document.getElementById('play-logo').classList.remove('playing');
});

function endGame() {
  document.getElementById('game-container').style.display = 'none';
  const endScreen = document.getElementById('end-screen');

  const entries = Object.entries(playerScores);
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const topScore = sorted[0][1];
  const winners = sorted.filter(([_, score]) => score === topScore);

  const winnerText = winners.length > 1
    ? `Tasapeli: ${winners.map(w => w[0]).join(' & ')}`
    : `Voittaja: ${winners[0][0]}`;

  document.getElementById('winner').innerText = winnerText;

  const scoreList = document.getElementById('score-list');
  scoreList.innerHTML = '';
  for (const [name, score] of entries) {
    const li = document.createElement('li');
    li.innerText = `${name}: ${score} pistettä`;
    scoreList.appendChild(li);
  }

  const validTracks = allTracks.filter(t => t.preview);
  if (validTracks.length > 0) {
    const outroTrack = validTracks[Math.floor(Math.random() * validTracks.length)];
    audio.src = outroTrack.preview;
    audio.play().catch(err => {
      console.warn("Autoplay ei sallittu, käyttäjän pitää klikata jotain ensin:", err);
    });
    document.getElementById('play-logo').classList.add('playing');
  }

  endScreen.style.display = 'block';
}
