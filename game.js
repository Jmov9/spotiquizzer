const accessToken = new URLSearchParams(window.location.search).get('access_token');
if (!accessToken) {
  document.body.innerHTML = "<h2>Token puuttuu! 😢</h2>";
  throw new Error("Access token not found");
}

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

// Virallinen "Today's Top Hits" soittolista
const playlistId = '37i9dQZF1DXcBWIGoYBM5M';

async function fetchPlaylistTracks() {
  console.log("🎵 Haetaan Today's Top Hits -soittolista...");

  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`, {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });

  if (!response.ok) {
    throw new Error(`API-virhe: ${response.status}`);
  }

  const data = await response.json();
  console.log("📦 Soittolistan tulos:", data);

  // Poimi kappaleet joilla on preview
  const previewable = data.items
    .map(item => item.track)
    .filter(track => track && track.preview_url);

  console.log("🎧 Esikuunneltavia kappaleita löytyi:", previewable.length);

  if (previewable.length < 4) {
    throw new Error("Liian vähän esikuunneltavia kappaleita");
  }

  return previewable;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function buildQuiz(tracks) {
  const correct = tracks[Math.floor(Math.random() * tracks.length)];
  const choices = shuffle(tracks).slice(0, 4);
  if (!choices.includes(correct)) {
    choices[Math.floor(Math.random() * 4)] = correct;
  }

  audio.src = correct.preview_url;

  choices.forEach(track => {
    const btn = document.createElement('button');
    btn.textContent = `${track.name} – ${track.artists[0].name}`;
    btn.onclick = () => {
      result.textContent =
        track.id === correct.id
          ? "✅ Oikein!"
          : `❌ Väärin! Oikea oli: ${correct.name} – ${correct.artists[0].name}`;
    };
    optionsDiv.appendChild(btn);
  });
}

fetchPlaylistTracks()
  .then(buildQuiz)
  .catch(err => {
    console.error("❌ Virhe:", err);
    result.textContent = "⚠️ Virhe: " + err.message;
  });
