import axios from 'https://cdn.skypack.dev/axios';

// Haetaan access token URLista tai localStoragesta
const tokenFromUrl = new URLSearchParams(window.location.search).get('access_token');
if (tokenFromUrl) {
  localStorage.setItem('access_token', tokenFromUrl);
}

const accessToken = localStorage.getItem('access_token');
if (!accessToken) {
  document.body.innerHTML = "<h2>🔒 Token puuttuu!</h2>";
  throw new Error("Access token not found");
}

console.log("🔐 Käytettävä token:", accessToken);

const playlistId = '6UeSakyzhiEt4NB3UAd6NQ'; // Billboard Hot 100
const market = 'FI';

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

// 🔄 Tokenin päivitys, jos saatavilla
async function refreshToken() {
  alert("🔁 Access token vanhentunut. Kirjaudu sisään uudelleen.");
  localStorage.removeItem('access_token');
  window.location.href = '/spotiquizzer/';
}

// 🔽 Haetaan kappaleet
async function getItems(url, isFirstPage = false) {
  try {
    const params = {
      ...(isFirstPage && { limit: 50 }),
      market,
    };

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      params,
    });

    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      await refreshToken();
    } else {
      throw err;
    }
  }
}

async function getAllTracks(url, all = []) {
  const data = await getItems(url, !all.length);
  if (!data) return [];

  const items = data.items.map(i => i.track).filter(t => t?.preview_url);
  all = all.concat(items);

  return data.next ? getAllTracks(data.next, all) : all;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// 🎮 Päälogiikka
(async () => {
  try {
    const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const allTracks = await getAllTracks(apiUrl);

    console.log("🎧 Esikuunneltavia kappaleita:", allTracks.length);
    if (allTracks.length < 4) throw new Error("Liian vähän esikuunneltavia kappaleita");

    const correct = allTracks[Math.floor(Math.random() * allTracks.length)];
    const choices = shuffle([...allTracks].slice(0, 4));
    if (!choices.includes(correct)) {
      choices[Math.floor(Math.random() * 4)] = correct;
    }

    audio.src = correct.preview_url;
    result.innerText = '';

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
    console.error("❌ Virhe:", err);
    result.innerText = "⚠️ Virhe: " + err.message;
  }
})();
