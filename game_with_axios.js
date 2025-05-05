import axios from 'https://cdn.skypack.dev/axios';

const accessToken = localStorage.getItem('access_token') ||
  new URLSearchParams(window.location.search).get('access_token');

if (!accessToken) {
  document.body.innerHTML = "<h2>🔒 Token puuttuu!</h2>";
  throw new Error("Access token not found");
}

localStorage.setItem('access_token', accessToken); // Tallenna token jos ei vielä ollut

console.log("🔐 Käytettävä token:", accessToken);

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

const playlistId = '6UeSakyzhiEt4NB3UAd6NQ'; // Billboard Hot 100
const market = 'FI';

async function fetchAllTracks(url, collected = []) {
  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    const isWrapped = res.data.items.length && res.data.items[0].track;
    const newItems = res.data.items
      .map(item => isWrapped ? item.track : item)
      .filter(track => track && track.preview_url);

    collected.push(...newItems);

    if (res.data.next) {
      return fetchAllTracks(res.data.next, collected);
    }

    return collected;
  } catch (err) {
    const errMsg = err.response?.data
      ? `Spotify API error ${err.response.status}: ${JSON.stringify(err.response.data)}`
      : err.message;

    console.error("❌ Axios-pyyntö epäonnistui:", errMsg);
    throw new Error(errMsg);
  }
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
          result.innerText = `❌ Väärin! Oikea oli: ${correct.name} – ${track.artists[0].name}`;
        }
      };
      optionsDiv.appendChild(btn);
    });
  } catch (err) {
    console.error("❌ Virhe:", err.message);
    result.innerText = "⚠️ Virhe: " + err.message;
  }
})();
