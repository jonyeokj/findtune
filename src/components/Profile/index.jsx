import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { useAuth } from '@/contexts/AuthContext';
import { useSpotify } from '@/contexts/SpotifyContext';
import Loader from '@/components/Loader';
import config from '@/config';

const Profile = ({ onClose }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const { isAuthenticated, isLoading, customFetch } = useAuth();
  const { pause } = useSpotify();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await customFetch(
          `${config.API_BASE_URL}/api/spotify-profile`,
          {
            credentials: 'include',
          },
        );

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          console.error('Failed to fetch profile');
          setError('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Error fetching profile');
      }
    };

    if (!isLoading) {
      fetchProfile();
    }
  }, [isAuthenticated, isLoading, customFetch]);

  const handleLogout = async () => {
    try {
      await pause();

      const response = await customFetch(`${config.API_BASE_URL}/api/logout`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        navigate('/login');
        onClose();
      } else {
        console.error('Logout failed');
        setError('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Error logging out');
    }
  };

  if (isLoading) {
    return (
      <div className='loader-container'>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className='profile-container'>
        <h1>Error</h1>
        <p>{error}</p>
        <div className='button-container'>
          <button onClick={onClose} className='standard-button'>
            Close
          </button>
          <button
            onClick={handleLogout}
            className='standard-button logout-button'
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='loader-container'>
        <Loader />
      </div>
    );
  }

  return (
    <div className='profile-container'>
      <h1>{profile.display_name}'s Spotify Profile</h1>
      {profile.images[0] && (
        <img
          src={
            profile.images.length > 1
              ? profile.images[1].url
              : profile.images[0].url
          }
          alt='Profile'
          className='profile-image'
        />
      )}
      <p>ID: {profile.id}</p>
      <p>Email: {profile.email}</p>
      <p>
        Profile Link:{' '}
        <a href={profile.external_urls.spotify}>
          {profile.external_urls.spotify}
        </a>
      </p>
      <p>
        API Link: <a href={profile.href}>{profile.href}</a>
      </p>
      <div className='button-container'>
        <button onClick={onClose} className='standard-button'>
          Close
        </button>
        <button
          onClick={handleLogout}
          className='standard-button logout-button'
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
