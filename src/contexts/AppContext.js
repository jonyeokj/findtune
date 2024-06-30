import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useGlobalState = () => useContext(AppContext);

export const GlobalStateProvider = ({ children }) => {
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [skipMode, setSkipMode] = useState(false);

  const [settings, setSettings] = useState({});

  const value = {
    selectedSongs,
    setSelectedSongs,
    likedSongs,
    setLikedSongs,
    hasStarted,
    setHasStarted,
    isPlaying,
    setIsPlaying,
    skipMode,
    setSkipMode,
    settings,
    setSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
