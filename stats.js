const accessToken = new URLSearchParams(window.location.search).get('access_token');

if (!accessToken) {
  document.body.innerHTML = "<h2>🔒 Token puuttuu!</h2>";
  throw new Error("Token puuttuu!");
}

const headers = {
  Authorization: `Bearer ${accessToken}`
};

async function fetchSpotifyData(endpoint) {
  const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, { headers });
  if (!res.ok) throw new Error(`Virhe haettaessa ${endpoint}: ${res.status}`);
  return res.json();
}

(async () => {
  try {
    // Profiilin perustiedot
    const profile = await fetchSpotifyData('me');
    document.getElementById('profile').innerHTML = `<p>Kirjautunut käyttäjänä: <strong>${profile.display_name}</strong></p>`;

    // Top kappaleet
    const topTracks = await fetchSpotifyData('me/top/tracks?limit=10');
    const trackList = document.getElementById('top-tracks');
    topTracks.items.forEach(track => {
      const li = document.createElement('li');
      li.innerText = `${track.name} – ${track.artists[0].name}`;
      trackList.appendChild(li);
    });

    // Top artistit
    const topArtists = await fetchSpotifyData('me/top/artists?limit=10');
    const artistList = document.getElementById('top-artists');
    topArtists.items.forEach(artist => {
      const li = document.createElement('li');
      li.innerText = artist.name;
      artistList.appendChild(li);
    });

  } catch (err) {
    console.error("❌ Virhe:", err);
    document.body.innerHTML += `<p>⚠️ ${err.message}</p>`;
  }
})();
