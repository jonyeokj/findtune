import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="container">
      <h1>Welcome to Findtune!</h1>
      <p>Discover new music by logging in with your Spotify account.</p>
      <Link to="/auth" className="authButton">Login with Spotify</Link>
      {/* You can add more content here such as features, about info, etc. */}
    </div>
  );
};

export default HomePage;
