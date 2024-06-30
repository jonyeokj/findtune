import React, { useState } from 'react';
import './styles.css';
import '@/App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog } from '@fortawesome/free-solid-svg-icons';
import { useGlobalState } from '@/contexts/AppContext';
import Search from '@/components/Search';
import StartButton from '@/components/StartButton';
import SongPanel from '@/components/SongPanel';
import Player from '@/components/Player';
import Profile from '@/components/Profile';
import Playlist from '@/components/Playlist';
import Modal from '@/components/Modal';
import SettingsModal from '@/components/Settings';

const HomePage = () => {
  const { hasStarted } = useGlobalState();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const openSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  const closeSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  return (
    <div className='main-container'>
      <div className='left-section'>
        <div className='top-controls'>
          <button
            onClick={openProfileModal}
            className='profile-button icon-button'
          >
            <FontAwesomeIcon icon={faUser} />
          </button>
          <button
            onClick={openSettingsModal}
            className='settings-button icon-button'
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
          {isProfileModalOpen && (
            <Modal
              content={<Profile onClose={closeProfileModal} />}
              onClose={closeProfileModal}
              disableClose={true}
            />
          )}
          {isSettingsModalOpen && (
            <Modal
              content={<SettingsModal onClose={closeSettingsModal} />}
              onClose={closeSettingsModal}
              disableClose={true}
            />
          )}
        </div>
        <div className='player-container'>
          {!hasStarted ? <StartButton /> : <Player />}
        </div>
      </div>
      <div className='right-section'>
        <div className='search-section'>
          <Search />
        </div>
        <div className='panel-section'>
          <SongPanel />
        </div>
        <div className='playlist-section'>
          <Playlist />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
