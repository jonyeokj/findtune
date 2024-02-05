import React from 'react';

const AuthPage = () => {
  const CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID'; // Replace with your Spotify Client ID
  const REDIRECT_URI = 'YOUR_APPLICATION_REDIRECT_URI'; // Must match the one set in Spotify Dashboard
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
  const RESPONSE_TYPE = 'token';
  const SCOPES = ['user-read-private', 'user-read-email']; // Replace or add more scopes as needed
  const STATE = 'YOUR_UNIQUE_STATE_STRING'; // A unique state string for CSRF protection

  const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES.join(' '))}&response_type=${RESPONSE_TYPE}&state=${STATE}`;

  const handleLogin = () => {
    window.location.href = authUrl;
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with Spotify</button>
    </div>
  );
};

export default AuthPage;
