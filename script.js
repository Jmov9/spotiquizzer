// ============================
// SpotiQuizzerin login-koodi
// ============================

// Tämä tiedosto hoitaa kirjautumisnapin toiminnan.
// Se EI enää käytä vanhaa token-flow'ta, vaan ohjaa backendille.
// Backend hoitaa Spotify-loginin ja ohjaa takaisin peliin (game.html?access_token=...)

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      // HUOM: Tämä osoite on sun backend, joka pyörii lokaalisti
      // Jos käytät julkista serveriä joskus, muuta tämä silloin
      window.location.href = 'http://127.0.0.1:8888/login';
    });
  }
});

