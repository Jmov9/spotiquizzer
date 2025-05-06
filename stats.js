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

// Päivitä statsit valitun ajanjakson mukaan
async function updateStats() {
  const timeRange = document.getElementById('timeRange').value;

  try {
    // Profiilin perustiedot
    const profile = await fetchSpotifyData('me');
    document.getElementById('profile').innerHTML = `<p>Kirjautunut käyttäjänä: <strong>${profile.display_name}</strong></p>`;

    // Top kappaleet
    const topTracks = await fetchSpotifyData(`me/top/tracks?limit=10&time_range=${timeRange}`);
    const trackList = document.getElementById('top-tracks');
    trackList.innerHTML = ''; // tyhjennä ennen uutta listaa
    topTracks.items.forEach(track => {
      const li = document.createElement('li');
      li.innerText = `${track.name} – ${track.artists[0].name}`;
      trackList.appendChild(li);
    });

    // Top artistit
    const topArtists = await fetchSpotifyData(`me/top/artists?limit=10&time_range=${timeRange}`);
    const artistList = document.getElementById('top-artists');
    artistList.innerHTML = ''; // tyhjennä ennen uutta listaa
    topArtists.items.forEach(artist => {
      const li = document.createElement('li');
      li.innerText = artist.name;
      artistList.appendChild(li);
    });

  } catch (err) {
    console.error("❌ Virhe:", err);
    document.body.innerHTML += `<p>⚠️ ${err.message}</p>`;
  }
}

// Ajanjakson dropdownin kuuntelu
document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('timeRange');
  if (select) {
    select.addEventListener('change', updateStats);
  }
  updateStats(); // aloitus
});
