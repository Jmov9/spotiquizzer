const accessToken = new URLSearchParams(window.location.search).get('access_token');

if (!accessToken) {
  document.body.innerHTML = "<h2>Token puuttuu! 😢</h2>";
  throw new Error("Access token not found");
}

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

// Haetaan satunnainen kappale Spotifysta (hakusana: "a", yleinen kirjain)
fetch('https://api.spotify.com/v1/search?q=a&type=track&limit=30', {
  headers: {
    Authorization: 'Bearer ' + accessToken,
  },
})
  .then(res => res.json())
  .then(data => {
    const tracks = data.tracks.items.filter(track => track.preview_url); // Vain biisit joilla on esikuuntelu
    if (tracks.length < 4) {
      result.innerText = "⚠️ Ei tarpeeksi kappaleita ladattavaksi. Lataa sivu uudelleen.";
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
    console.error("Virhe:", err);
    result.innerText = "⚠️ Virhe haettaessa kappaletta.";
  });

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
