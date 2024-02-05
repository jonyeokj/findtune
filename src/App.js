import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import CallbackPage from './components/CallbackPage'; // This will handle the redirect from Spotify

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/callback" element={<CallbackPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
