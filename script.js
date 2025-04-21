const clientId = 'SUN_CLIENT_ID_TÄHÄN'; // Vaihda tähän oma Spotify client ID
const redirectUri = 'http://localhost:5500/';
const scopes = ['user-read-private']; // Ei tarvita juuri muuta nyt

document.getElementById('loginBtn').addEventListener('click', () => {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join('%20')}`;
  window.location.href = authUrl;
});

// Kun palataan takaisin redirectissä, napataan access_token URLista
window.onload = () => {
  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get('access_token');
    if (token) {
      localStorage.setItem('spotify_token', token);
      alert('Kirjautuminen onnistui!');
      // Siirrytään peliin – voit vaikka ohjata peli.html-tiedostoon tms.
      // window.location.href = "game.html";
    }
  }
};
