
import axios from 'https://cdn.skypack.dev/axios'; // Varmistetaan Axiosin saatavuus selaimessa

const accessToken = localStorage.getItem('access_token') ||
  new URLSearchParams(window.location.search).get('access_token');

if (accessToken) {
  localStorage.setItem('access_token', accessToken);
} else {
  document.body.innerHTML = "<h2>🔒 Token puuttuu!</h2>";
  throw new Error("Access token not found");
}

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

const playlistId = '37i9dQZF1DX4UtSsGT1Sbe'; // All Out 00s
const market = 'FI';

console.log("🎧 Käytettävä token:", accessToken);

async function fetchTracks() {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&market=${market}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const allTracks = response.data.items
      .map(item => item.track)
      .filter(track => track && track.preview_url);

    if (allTracks.length < 4) {
      throw new Error("Liian vähän esikuunneltavia kappaleita");
    }

    const correct = allTracks[Math.floor(Math.random() * allTracks.length)];
    const choices = shuffle([...allTracks].slice(0, 4));
    if (!choices.includes(correct)) {
      choices[Math.floor(Math.random() * 4)] = correct;
    }

    audio.src = correct.preview_url;

    choices.forEach(track => {
      const btn = document.createElement('button');
      btn.innerText = `${track.name} – ${track.artists[0].name}`;
      btn.onclick = () => {
        if (track.id === correct.id) {
          result.innerText = "✅ Oikein!";
        } else {
          result.innerText = `❌ Väärin! Oikea oli: ${correct.name} – ${correct.artists[0].name}`;
        }
      };
      optionsDiv.appendChild(btn);
    });

  } catch (err) {
    console.error("❌ Axios-pyyntö epäonnistui:", err);
    result.innerText = "⚠️ Virhe: " + err.message;
  }
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

fetchTracks();
