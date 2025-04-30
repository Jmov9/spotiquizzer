
import axios from 'https://cdn.skypack.dev/axios';

const accessToken = localStorage.getItem('access_token') ||
  new URLSearchParams(window.location.search).get('access_token');

if (!accessToken) {
  document.body.innerHTML = "<h2>🔒 Token puuttuu!</h2>";
  throw new Error("Access token not found");
}

console.log("🔑 Käytettävä token:", accessToken);

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

const playlistId = '6UeSakyzhiEt4NB3UAd6NQ'; // mun oma
const market = 'FI';

async function fetchTracks() {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&market=${market}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      }
    });

    const data = response.data;

    const playableTracks = data.items
      .map(item => item.track)
      .filter(track => track && track.preview_url);

    console.log("🎧 Esikuunneltavia:", playableTracks.length);

    if (playableTracks.length < 4) {
      throw new Error("Liian vähän esikuunneltavia kappaleita");
    }

    const correct = playableTracks[Math.floor(Math.random() * playableTracks.length)];
    const choices = shuffle([...playableTracks].slice(0, 4));
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
    result.innerText = "⚠️ Virhe: " + (err.response?.data?.error?.message || err.message);
  }
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

fetchTracks();
