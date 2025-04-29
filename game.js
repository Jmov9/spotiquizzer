fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=50`, {
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
  })
    .then(res => res.json())
    .then(data => {
      console.log("API-haun tulos:", data); // 👈 Näytetään koko haettu data
  
      const tracks = data.tracks.items.filter(track => track.preview_url);
  
      console.log("Esikuuntelulliset kappaleet:", tracks.length); // 👈 Näytetään montako biisiä jäi
  
      if (tracks.length < 4) {
        console.warn("⚠️ Liian vähän biisejä. Ei jatketa.");
        result.innerText = "⚠️ Ei tarpeeksi esikuunneltavia kappaleita. Lataa sivu uudelleen.";
        return;
      }
  
      const correct = tracks[Math.floor(Math.random() * tracks.length)];
      console.log("Testaa preview:", correct.preview_url); // 👈 Testaa biisin linkki
  
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
      console.error("Virhe API-haussa:", err);
      result.innerText = "⚠️ Tapahtui virhe haettaessa kappaleita.";
    });
  