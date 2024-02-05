import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    let token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1];

    // Store the token in local storage or context for future API calls
    localStorage.setItem('spotify_access_token', token);

    // Redirect to another page after successful login
    navigate('/'); // Redirect to home or another page
  }, [navigate]);

  return (
    <div>
      Redirecting...
    </div>
  );
};

export default CallbackPage;
