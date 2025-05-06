const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');
const currentPlayerLabel = document.getElementById('current-player');

let players = [];
let currentPlayerIndex = 0;
let answeredThisRound = [];
let currentCorrectTrack = null;
let allTracks = [];
let queriesDone = 0;
let playerScores = {};
let roundsPlayed = 0;
const maxRounds = 10;


// ==============================
// PELITILAN ASETUKSET
// ==============================

function startSolo() {
  localStorage.setItem('mode', 'solo');
  document.getElementById('setup').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  players = ['solo'];
playerScores = { solo: 0 };
roundsPlayed = 0;


  
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
    players = names;
    playerScores = {};
    names.forEach(name => playerScores[name] = 0);
    roundsPlayed = 0;
    


  if (names.length < 2) {
    alert('Anna vähintään kaksi nimeä!');
    return;
  }

  players = names;
  currentPlayerIndex = 0;
  localStorage.setItem('mode', 'party');

  document.getElementById('setup').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  startGame();
}

// ==============================
// API JA LOGIIKKA
// ==============================

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
  const isCorrect = selectedTrack.id === currentCorrectTrack.id;

  result.innerText = isCorrect
    ? "✅ Oikein!"
    : `❌ Väärin! Oikea oli: ${currentCorrectTrack.title} – ${currentCorrectTrack.artist.name}`;

  answeredThisRound.push(players[currentPlayerIndex] || 'solo');

  if (localStorage.getItem('mode') === 'party') {
    currentPlayerIndex++;
    if (currentPlayerIndex >= players.length) {
      currentPlayerIndex = 0;
      answeredThisRound = [];
      setTimeout(startGame, 1500);
    } else {
      setTimeout(presentQuestion, 1500);
    }
  } else {
    setTimeout(startGame, 1500);
  }
  if (isCorrect) {
    const name = players[currentPlayerIndex] || 'solo';
    playerScores[name]++;
  }
  
  if (localStorage.getItem('mode') === 'party') {
    currentPlayerIndex++;
    if (currentPlayerIndex >= players.length) {
      currentPlayerIndex = 0;
      answeredThisRound = [];
      roundsPlayed++;
      if (roundsPlayed >= maxRounds) {
        endGame();
        return;
      }
      setTimeout(startGame, 1500);
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
    result.innerText = "⚠️ Ei tarpeeksi esikuunneltavia kappaleita.";
    return;
  }

  if (localStorage.getItem('mode') === 'party') {
    const playerName = players[currentPlayerIndex];
    currentPlayerLabel.innerText = `🎮 ${playerName}, sinun vuoro!`;
  } else {
    currentPlayerLabel.innerText = '';
  }

  currentCorrectTrack = validTracks[Math.floor(Math.random() * validTracks.length)];
  const choices = shuffle([...validTracks].slice(0, 4));
  if (!choices.includes(currentCorrectTrack)) {
    choices[Math.floor(Math.random() * 4)] = currentCorrectTrack;
  }

  audio.src = currentCorrectTrack.preview;
  audio.play();

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
function endGame() {
    document.getElementById('game-container').style.display = 'none';
    const endScreen = document.getElementById('end-screen');
    const winner = Object.entries(playerScores).sort((a, b) => b[1] - a[1])[0];
  
    document.getElementById('winner').innerText = `🏆 Voittaja: ${winner[0]}`;
    const scoreList = document.getElementById('score-list');
    scoreList.innerHTML = '';
  
    for (const [name, score] of Object.entries(playerScores)) {
      const li = document.createElement('li');
      li.innerText = `${name}: ${score} pistettä`;
      scoreList.appendChild(li);
    }
  
    endScreen.style.display = 'block';
  }
  
