const accessToken = new URLSearchParams(window.location.search).get('access_token');

if (!accessToken) {
  document.body.innerHTML = "<h2>🔒 Token puuttuu! Kirjaudu ensin sisään.</h2>";
  throw new Error("Access token not found");
}

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

// 🎯 Haetaan biisit tietystä soittolistasta (esim. Top 50 Global)
const playlistId = '37i9dQZEVXbMDoHDwVN2tF';
const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

console.log("🔎 Haetaan soittolista:", apiUrl);

fetch(apiUrl, {
  headers: { Authorization: 'Bearer ' + accessToken },
})
  .then(res => res.json())
  .then(data => {
    const items = data.items || [];
    const tracks = items
      .map(item => item.track)
      .filter(track => track && track.preview_url);

    console.log("🎵 Soittokelpoisia kappaleita:", tracks.length);

    if (tracks.length < 4) {
      result.innerText = "⚠️ Ei tarpeeksi esikuunneltavia kappaleita.";
      throw new Error("Liian vähän esikuunneltavia kappaleita");
    }

    const correct = tracks[Math.floor(Math.random() * tracks.length)];
    const choices = shuffle(tracks).slice(0, 4);

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
          result.innerText = `❌ Väärin! Oikea vastaus oli: ${correct.name} – ${track.artists[0].name}`;
        }
      };
      optionsDiv.appendChild(btn);
    });
  })
  .catch(err => {
    console.error("❌ Virhe:", err);
    result.innerText = "⚠️ Ei kappaleita ladattavaksi. Tarkista token tai yritä myöhemmin.";
  });

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
