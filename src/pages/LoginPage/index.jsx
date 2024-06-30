import React from 'react';
import './styles.css';
import '@/App.css';
import spotifyLogo from '@/assets/images/spotify-logo.png';
import config from '@/config';

const LoginPage = () => {
  return (
    <div className='login-page-container'>
      <div className='login-container'>
        <h1 className='login-header'>
          Findtune for <img src={spotifyLogo} alt='Spotify logo' />
        </h1>
        <p>Discover new music by logging in with your Spotify account.</p>
        <a href={`${config.API_BASE_URL}/login`} className='login-button'>
          Login with Spotify
        </a>
      </div>
    </div>
  );
};

export default LoginPage;
