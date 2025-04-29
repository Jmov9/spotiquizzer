const accessToken = new URLSearchParams(window.location.search).get('access_token');

if (!accessToken) {
  document.body.innerHTML = "<h2>Token puuttuu! 😢</h2>";
  throw new Error("Access token not found");
}

const audio = document.getElementById('audioPlayer');
const optionsDiv = document.getElementById('options');
const result = document.getElementById('result');

// 🔁 Satunnainen kirjain a–z
const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26));

fetch(`https://api.spotify.com/v1/search?q=${randomLetter}&type=track&limit=50`, {
  headers: {
    Authorization: 'Bearer ' + accessToken,
  },
})
  .then(res => res.json())
  .then(data => {
    const tracks = data.tracks.items.filter(track => track.preview_url); // Vain biisit joilla on preview
    if (tracks.length < 4) throw new Error("Ei tarpeeksi esikuunneltavia kappaleita");

    const correct = tracks[Math.floor(Math.random() * tracks.length)];
    const choices = shuffle([...tracks].slice(0, 4));
    if (!choices.includes(correct)) choices[Math.floor(Math.random() * 4)] = correct;

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
    console.error(err);
    result.innerText = "⚠️ Ei tarpeeksi kappaleita ladattavaksi. Lataa sivu uudelleen.";
  });

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
