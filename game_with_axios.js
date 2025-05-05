import axios from 'https://cdn.skypack.dev/axios';

const accessToken =
  localStorage.getItem('access_token') ||
  new URLSearchParams(window.location.search).get('access_token');

if (!accessToken) {
  document.body.innerHTML = "<h2>🔒 Token puuttuu!</h2>";
  throw new Error("Access token not found");
}

localStorage.setItem('access_token', accessToken);

console.log("🔐 Token:", accessToken);

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

// ✅ Käytettävä soittolista
const playlistId = '6UeSakyzhiEt4NB3UAd6NQ';
const market = 'US'; // Tämä markkina toimii listalle varmasti!

async function fetchAllTracks(url, playlistType = 'regular', collected = []) {
  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    const items = res.data.items;
    const tracks = playlistType === 'top' ? items : items.map(e => e.track);
    const withPreview = tracks.filter(t => t && t.preview_url);

    collected.push(...withPreview);

    if (res.data.next) {
      return fetchAllTracks(res.data.next, playlistType, collected);
    }

    return collected;
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error("❌ Spotify API error:", err.response?.data || err);
    throw new Error("Spotify API error " + err.response?.status + ": " + msg);
  }
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

(async () => {
  try {
    const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&market=${market}`;
    const allTracks = await fetchAllTracks(apiUrl, 'regular');

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
          result.innerText = `❌ Väärin! Oikea oli: ${correct.name} – ${track.artists[0].name}`;
        }
      };
      optionsDiv.appendChild(btn);
    });
  } catch (err) {
    console.error("❌ Virhe:", err);
    result.innerText = "⚠️ Virhe: " + err.message;
  }
})();
