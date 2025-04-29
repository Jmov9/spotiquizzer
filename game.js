const accessToken = new URLSearchParams(window.location.search).get('access_token');

if (!accessToken) {
  document.body.innerHTML = "<h2>🔒 Token puuttuu!</h2>";
  throw new Error("Access token not found");
}

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

const playlistId = '37i9dQZF1DXcBWIGoYBM5M'; // Today's Top Hits

console.log("🎵 Haetaan Today's Top Hits -soittolista...");

fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`, {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
})
  .then(res => {
    if (!res.ok) throw new Error("API-virhe: " + res.status);
    return res.json();
  })
  .then(data => {
    console.log("✅ API-vastaus:", data);

    const playable = data.items
      .map(item => item.track)
      .filter(track => track && track.preview_url);

    console.log("🎧 Soittokelpoisia kappaleita:", playable.length);

    if (playable.length < 4) {
      throw new Error("Liian vähän esikuunneltavia kappaleita");
    }

    const correct = playable[Math.floor(Math.random() * playable.length)];
    const choices = shuffle([...playable].slice(0, 4));

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
  })
  .catch(err => {
    console.error("❌ Virhe:", err);
    result.innerText = "⚠️ Virhe: " + err.message;
  });

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
