// =====================
// 🔐 Access Token käsittely
// =====================
let accessToken = localStorage.getItem('access_token');

const tokenFromUrl = new URLSearchParams(window.location.search).get('access_token');
if (tokenFromUrl) {
  accessToken = tokenFromUrl;
  localStorage.setItem('access_token', accessToken);
  history.replaceState(null, '', window.location.pathname); // Piilota token URL:sta
}

if (!accessToken) {
  document.body.innerHTML = "<h2>🔒 Token puuttuu!</h2>";
  throw new Error("Access token not found");
}

// =====================
// 🎵 Pelin logiikka
// =====================
const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

// Billboard Hot 100 -soittolista
const playlistId = '6UeSakyzhiEt4NB3UAd6NQ';
const market = 'FI';

async function fetchAllTracks(url, allTracks = []) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error("API-virhe: " + res.status + " - " + JSON.stringify(err));
  }

  const data = await res.json();

  const items = data.items
    .map(item => item.track)
    .filter(track => track && track.preview_url);

  allTracks.push(...items);

  if (data.next) {
    return fetchAllTracks(data.next, allTracks);
  }

  return allTracks;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

(async () => {
  try {
    const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&market=${market}`;
    const allTracks = await fetchAllTracks(apiUrl);

    console.log("🎧 Esikuunneltavia kappaleita:", allTracks.length);
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
    console.error("❌ Virhe:", err);
    result.innerText = "⚠️ Virhe: " + err.message;
  }
})();
