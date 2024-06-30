import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SpotifyProvider } from './contexts/SpotifyContext';
import { GlobalStateProvider } from './contexts/AppContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './contexts/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SpotifyProvider>
        <GlobalStateProvider>
          <Router>
            <Routes>
              <Route path='/login' element={<LoginPage />} />
              <Route
                path='/'
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </GlobalStateProvider>
      </SpotifyProvider>
    </AuthProvider>
  );
}

export default App;
