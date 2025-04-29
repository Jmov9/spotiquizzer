const accessToken = new URLSearchParams(window.location.search).get('access_token');
if (!accessToken) {
  document.body.innerHTML = "<h2>Token puuttuu! 😢</h2>";
  throw new Error("Access token not found");
}

const playlistId = '0bIUgov7PqxNuASp4dQGYU';
const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

// 🧠 Apufunktio sekoitukseen
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

console.log("🔄 Haetaan soittolista:", apiUrl);

fetch(apiUrl, {
  headers: {
    Authorization: 'Bearer ' + accessToken,
  },
})
  .then(res => res.json())
  .then(data => {
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("Virheellinen vastaus tai ei kappaleita.");
    }

    const tracks = data.items
      .map(item => item.track)
      .filter(track => track && track.preview_url);

    console.log("🎵 Soittokelpoisia kappaleita:", tracks.length);

    if (tracks.length < 4) {
      throw new Error("Liian vähän esikuunneltavia kappaleita");
    }

    const correct = tracks[Math.floor(Math.random() * tracks.length)];
    const choices = shuffle(tracks.filter(t => t.id !== correct.id)).slice(0, 3);
    choices.push(correct);

    const finalChoices = shuffle(choices);
    audio.src = correct.preview_url;

    finalChoices.forEach(track => {
      const btn = document.createElement('button');
      btn.innerText = `${track.name} – ${track.artists[0].name}`;
      btn.onclick = () => {
        if (track.id === correct.id) {
          result.innerText = "✅ Oikein!";
        } else {
          result.innerText = `❌ Väärin! Oikea vastaus oli: ${correct.name} – ${correct.artists[0].name}`;
        }
      };
      optionsDiv.appendChild(btn);
    });
  })
  .catch(err => {
    console.error("❌ API-virhe:", err);
    result.innerText = "⚠️ Virhe: " + err.message;
  });
