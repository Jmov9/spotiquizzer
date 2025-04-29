const accessToken = new URLSearchParams(window.location.search).get('access_token');

if (!accessToken) {
  document.body.innerHTML = "<h2>Token puuttuu! 😢</h2>";
  throw new Error("Access token not found");
}

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

// 🎵 Satunnaiset hakusanat
const searchTerms = ['love', 'rock', 'live', 'hit', 'music', 'dance', 'night', 'summer', 'happy', 'dream', 'party'];
const searchQuery = searchTerms[Math.floor(Math.random() * searchTerms.length)];

console.log("🔎 Haetaan biisejä hakusanalla:", searchQuery);

fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=50`, {
  headers: {
    Authorization: 'Bearer ' + accessToken,
  },
})
  .then(res => res.json())
  .then(data => {
    console.log("📦 API-haun tulos:", data);

    const tracks = data.tracks.items.filter(track => track.preview_url);
    console.log("🎵 Esikuuntelullisia kappaleita löytyi:", tracks.length);

    if (tracks.length < 4) {
      console.warn("⚠️ Liian vähän biisejä, peli ei voi jatkua.");
      result.innerText = "⚠️ Ei tarpeeksi esikuunneltavia kappaleita. Lataa sivu uudelleen.";
      return;
    }

    const correct = tracks[Math.floor(Math.random() * tracks.length)];
    console.log("▶️ Valittu kappaleen preview:", correct.preview_url);

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
    console.error("❌ Virhe haettaessa kappaleita:", err);
    result.innerText = "⚠️ Tapahtui virhe. Yritä ladata sivu uudelleen.";
  });

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
