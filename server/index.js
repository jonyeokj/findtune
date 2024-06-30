require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');

const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');

const app = express();
const port = process.env.SERVER_PORT || 8888;
const domain = process.env.DOMAIN;
const redirect_uri = process.env.REDIRECT_URI;

app.use(
  cors({
    origin: domain,
    credentials: true,
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: 'auto', httpOnly: true },
    name: 'findtune-cookie',
  }),
);

app.use(express.json());

function generateCodeVerifier(length) {
  let text = '';
  let possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function generateCodeChallenge(codeVerifier) {
  // Using crypto.createHash to generate SHA-256 hash of the verifier
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();

  // Converting the hash to base64url format
  const base64url = hash
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return base64url;
}

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const state = generateCodeVerifier(16);
const scope =
  'user-read-private user-read-email user-read-playback-state user-read-currently-playing user-modify-playback-state playlist-modify-public streaming';

app.get('/api/login', function (req, res) {
  const verifier = generateCodeVerifier(128);
  const challenge = generateCodeChallenge(verifier);

  req.session.verifier = verifier;

  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
        code_challenge_method: 'S256',
        code_challenge: challenge,
      }),
  );
});

app.get('/api/logout', function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('findtune-cookie');
    res.status(200).json({ message: 'Logout successful' });
  });
});

app.get('/api/callback', async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const verifier = req.session.verifier;

  if (state === null || !verifier) {
    res.redirect(`${domain}/?error=state_mismatch_or_missing_verifier`);
  } else {
    try {
      const tokenResponse = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
          client_id: client_id,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirect_uri,
          code_verifier: verifier,
        }),
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      req.session.accessToken = tokenResponse.data.access_token;
      req.session.refreshToken = tokenResponse.data.refresh_token;
      req.session.expiresIn = tokenResponse.data.expires_in;

      const userProfileResponse = await axios.get(
        'https://api.spotify.com/v1/me',
        {
          headers: { Authorization: `Bearer ${req.session.accessToken}` },
        },
      );
      req.session.userId = userProfileResponse.data.id;

      res.redirect(domain);
    } catch (error) {
      console.error(
        'Error during the authentication process:',
        error.response?.data || error.message,
      );
      // Handle token exchange failure
      req.session.accessToken = null;
      req.session.refreshToken = null;
      req.session.userId = null;

      res.redirect(domain);
    }
  }
});

app.get('/api/access-token', (req, res) => {
  if (req.session && req.session.accessToken) {
    res.json({
      accessToken: req.session.accessToken,
      expiresIn: req.session.expiresIn,
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/api/refresh-token', async (req, res) => {
  const { refreshToken } = req.session;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Unauthorized - No refresh token' });
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });

    const data = await response.json();
    if (data.access_token) {
      req.session.accessToken = data.access_token;
      if (data.refresh_token) {
        req.session.refreshToken = data.refresh_token;
      }
      req.session.expiresIn = data.expires_in ? data.expires_in : 3600;

      res.json({ accessToken: data.access_token, expiresIn: data.expires_in });
    } else {
      res.status(500).json({ error: 'Failed to refresh access token' });
    }
  } catch (error) {
    console.error('Error refreshing access token:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/spotify-profile', async (req, res) => {
  if (!req.session.accessToken) {
    return res.status(403).json({ error: 'Access token is missing' });
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${req.session.accessToken}` },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch Spotify profile:', error);
    res.status(500).json({ error: 'Failed to fetch Spotify profile' });
  }
});

app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  if (!req.session.accessToken) {
    return res.status(403).json({ error: 'Access token is missing' });
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query,
      )}&type=track&limit=30`,
      {
        headers: { Authorization: `Bearer ${req.session.accessToken}` },
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch songs');
    return;
  }
});

app.get('/api/recommendations', async (req, res) => {
  const { seed_tracks } = req.query;

  if (!req.session.accessToken || !seed_tracks) {
    return res
      .status(403)
      .json({ error: 'Access token or seed tracks are missing' });
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?seed_tracks=${seed_tracks}&limit=1`,
      {
        headers: { Authorization: `Bearer ${req.session.accessToken}` },
      },
    );

    // Check if the API rate limit has been exceeded
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
      return res
        .status(429)
        .json({ error: 'Rate limit exceeded', retryAfter: retryAfter });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

app.get('/api/currently-playing', async (req, res) => {
  if (!req.session.accessToken) {
    return res.status(403).json({ error: 'Access token is missing' });
  }

  try {
    const response = await fetch(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: { Authorization: `Bearer ${req.session.accessToken}` },
      },
    );

    if (response.status === 204) {
      // Check for No Content status
      console.log('No currently playing track.');
      return res.status(204).send();
    }

    if (!response.ok) {
      console.error(`Spotify API Error: ${response.statusText}`);
      return res
        .status(response.status)
        .json({ error: `Spotify API Error: ${response.statusText}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching currently playing track:', error);
    res.status(500).json({ error: 'Failed to fetch currently playing track' });
  }
});

app.post('/api/play', async (req, res) => {
  const { uris, deviceId } = req.body;
  const accessToken = req.session.accessToken;

  if (!accessToken) {
    return res.status(403).json({ error: 'Access token is missing' });
  }

  const fetchOptions = {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: uris ? JSON.stringify({ uris }) : undefined,
  };

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(
        deviceId,
      )}`,
      fetchOptions,
    );

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Spotify API error response:', errorBody);
      throw new Error(`Failed to start playback: ${errorBody.error.message}`);
    }

    res.status(200).json({ message: 'Playback started successfully' });
  } catch (error) {
    console.error('Error starting playback:', error);
    res.status(500).json({ error: 'Failed to start playback' });
  }
});

app.post('/api/pause', async (req, res) => {
  const { deviceId } = req.body;
  const accessToken = req.session.accessToken;

  if (!accessToken) {
    return res.status(403).json({ error: 'Access token is missing' });
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/pause?device_id=${encodeURIComponent(
        deviceId,
      )}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Spotify API error response:', errorBody);
      throw new Error(`Failed to start playback: ${errorBody}`);
    }

    res.status(200).json({ message: 'Playback started successfully' });
  } catch (error) {
    console.error('Error starting playback:', error);
    res.status(500).json({ error: 'Failed to start playback' });
  }
});

app.put('/api/volume', async (req, res) => {
  const { volume, deviceId } = req.body;
  const accessToken = req.session.accessToken;

  if (!accessToken) {
    return res.status(403).json({ error: 'Access token is missing' });
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}&device_id=${encodeURIComponent(
        deviceId,
      )}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    res.status(200).json({ message: 'Volume set successfully' });
  } catch (error) {
    console.error('Error setting volume:', error);
    res.status(500).json({ error: 'Failed to set volume' });
  }
});

app.post('/api/create-playlist', async (req, res) => {
  const { name } = req.body;
  if (!req.session.accessToken || !req.session.userId) {
    console.log(req.session.accessToken);
    console.log(req.session.userId);
    console.log('failed, 403 error');
    return res.status(403).json({ error: 'Authorization required' });
  }

  try {
    // Check for existing playlist named "Findtune"
    const playlistsResponse = await axios.get(
      `https://api.spotify.com/v1/users/${req.session.userId}/playlists`,
      {
        headers: { Authorization: `Bearer ${req.session.accessToken}` },
      },
    );
    const findtunePlaylist = playlistsResponse.data.items.find(
      (playlist) => playlist.name === name,
    );

    if (findtunePlaylist) {
      // If playlist exists, return its ID
      res.json({ id: findtunePlaylist.id });
    } else {
      // If not, create a new playlist
      const createResponse = await axios.post(
        `https://api.spotify.com/v1/users/${req.session.userId}/playlists`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${req.session.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      res.json({ id: createResponse.data.id });
    }
  } catch (error) {
    console.error(
      'Failed to create or find playlist:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: 'Failed to create or find playlist' });
  }
});

app.post('/api/add-track', async (req, res) => {
  // Extract both playlistId and uri from query params
  const { playlistId, uri } = req.query;

  if (!req.session.accessToken || !playlistId || !uri) {
    return res
      .status(403)
      .json({ error: 'Missing required parameters or access token' });
  }

  try {
    const response = await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      { uris: [uri] },
      {
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    res.json({ message: 'Track added successfully' });
  } catch (error) {
    console.error('Error adding track:', error);
    res.status(500).json({ error: 'Failed to add track to playlist' });
  }
});

// Serve static files from the React app build directory
app.use(express.static('../build'));

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
