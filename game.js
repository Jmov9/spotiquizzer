const accessToken = localStorage.getItem('access_token') ||
  new URLSearchParams(window.location.search).get('access_token');

if (!accessToken) {
  document.body.innerHTML = "<h2>🔒 Token puuttuu!</h2>";
  throw new Error("Access token not found");
}

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

// Käytettävä soittolista (Billboard Hot 100 tässä esimerkissä)
const playlistId = '6UeSakyzhiEt4NB3UAd6NQ';
const market = 'FI'; // Voit muuttaa tarpeen mukaan

/**
 * Haetaan kaikki kappaleet sivutettuna ja suodatetaan vain esikuunneltavat
 */
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

  // Vain kappaleet joilla on esikuuntelu (preview_url)
  const items = data.items
    .map(item => item.track)
    .filter(track => track && track.preview_url);

  allTracks.push(...items);

  // Jos on lisää sivuja, haetaan seuraava sivu
  if (data.next) {
    return fetchAllTracks(data.next, allTracks);
  }

  return allTracks;
}

/**
 * Sekoitusalgoritmi
 */
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

    // Valitaan satunnainen oikea vastaus
    const correct = allTracks[Math.floor(Math.random() * allTracks.length)];

    // Valitaan 4 vaihtoehtoa
    const choices = shuffle([...allTracks].slice(0, 4));
    if (!choices.includes(correct)) {
      choices[Math.floor(Math.random() * 4)] = correct;
    }

    // Asetetaan äänileike
    audio.src = correct.preview_url;

    // Luodaan painikkeet
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
