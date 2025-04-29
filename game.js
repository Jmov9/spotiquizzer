const accessToken = new URLSearchParams(window.location.search).get('access_token');

if (!accessToken) {
  document.body.innerHTML = "<h2>Token puuttuu! </h2>";
  throw new Error("Access token not found");
}

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

const playlistId = '37i9dQZEVXbMDoHDwVN2tF';



function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function fetchFromPlaylist() {
  fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`, {
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
  })
    .then(res => res.json())
    .then(data => {
      console.log("🎧 Soittolistan tulos:", data);

      const tracks = data.items
        .map(item => item.track)
        .filter(track => track && track.preview_url);

      console.log(`🎵 Soittokelpoisia: ${tracks.length}`);

      if (tracks.length < 4) {
        result.innerText = "⚠️ Ei tarpeeksi esikuunneltavia kappaleita.";
        return;
      }

      const correct = tracks[Math.floor(Math.random() * tracks.length)];
      const wrongChoices = tracks.filter(t => t.id !== correct.id);
      const randomWrong = shuffle(wrongChoices).slice(0, 3);
      const choices = shuffle([correct, ...randomWrong]);

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
      console.error("❌ API-virhe:", err);
      result.innerText = "⚠️ Tapahtui virhe. Yritä uudelleen.";
    });
}

//  Käynnistä
fetchFromPlaylist();
