const express = require('express');
const request = require('request');
const cors = require('cors');
const querystring = require('querystring');
require('dotenv').config();

const app = express();
app.use(cors());

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

app.get('/login', (req, res) => {
  const scope = 'user-read-private playlist-read-private playlist-read-collaborative user-top-read';


  const params = querystring.stringify({
    response_type: 'code',
    client_id,
    scope,
    redirect_uri,
  });
  res.redirect('https://accounts.spotify.com/authorize?' + params);
});

app.get('/callback', (req, res) => {
  const code = req.query.code || null;

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code,
      redirect_uri,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
    },
    json: true,
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const { access_token, refresh_token } = body;
      res.redirect(`https://jmov9.github.io/spotiquizzer/stats.html?access_token=${access_token}`);


    

  
    } else {
      res.send('Error during token exchange');
    }
  });
});

app.listen(8888, () => {
  console.log('Server running at http://localhost:8888');
});
