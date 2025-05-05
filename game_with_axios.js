import axios from 'https://cdn.skypack.dev/axios';

const urlToken = new URLSearchParams(window.location.search).get('access_token');
const storageToken = localStorage.getItem('access_token');

console.log("🔍 Token URLista:", urlToken);
console.log("🔍 Token localStoragesta:", storageToken);

let accessToken = urlToken || storageToken;

if (urlToken && urlToken !== storageToken) {
  console.log("💾 Päivitetään localStorage uudella tokenilla...");
  localStorage.setItem('access_token', urlToken);
}

if (!accessToken || accessToken.length < 50) {
  document.body.innerHTML = "<h2>🔒 Virhe: Token puuttuu tai on liian lyhyt!</h2>";
  throw new Error("Access token missing or invalid");
}

console.log("🔐 Käytettävä token:", accessToken);

// ⬇ tästä eteenpäin voi jatkua vanha toimiva koodi esim. fetchAllTracks jne...



const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

// 🎵 Toimiva soittolista: Global Top 50
const playlistId = '6UeSakyzhiEt4NB3UAd6NQ';
const market = 'FI';

async function fetchAllTracks(url, collected = []) {
    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      });
  
      const items = res.data.items.map(item => item.track).filter(track => track && track.preview_url);
      collected.push(...items);
  
      if (res.data.next) {
        return fetchAllTracks(res.data.next, collected);
      }
  
      return collected;
    } catch (err) {
      // 👇 Tarkempi virheen tulostus
      if (err.response) {
        console.error("❌ Spotify API vastasi virheellä:");
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
        throw new Error(`Spotify API error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else {
        console.error("❌ Axios virhe:", err);
        throw new Error("AxiosError: " + err.message);
      }
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
