import React, { useState } from 'react';
import '@/App.css';
import './styles.css';
import { useSpotify } from '@/contexts/SpotifyContext';
import { useGlobalState } from '@/contexts/AppContext';
import Modal from '@/components/Modal';

const StartButton = () => {
  const { fetchAndPlayRecommendation, deviceId } = useSpotify();
  const { selectedSongs, setIsPlaying, setHasStarted } = useGlobalState();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const handlePlayClick = async () => {
    if (selectedSongs.length < 1) {
      setModalContent('Please select at least 1 song to start playing.');
      setModalVisible(true);
      return;
    }

    if (!deviceId) {
      console.error('Device ID not available.');
      return;
    }

    setIsPlaying(true);
    setHasStarted(true);

    const seedTracks = selectedSongs.map((song) => song.id).join(',');

    try {
      fetchAndPlayRecommendation(seedTracks);
    } catch (error) {
      console.error('Error during playlist creation and playback:', error);
      setIsPlaying(false);
      setHasStarted(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <div className='start-button-container'>
      <h1>Findtune for Spotify</h1>
      <div className='steps'>
        <p>Spotify has deprecated the Recommendations API.</p>
        <p>You can no longer generate new recommendations with seed songs.</p>
        <p>Thank you for using this web app.</p>
      </div>
      {/* <button onClick={handlePlayClick} className='standard-button'>
        Play
      </button> */}
      {modalVisible && <Modal content={modalContent} onClose={closeModal} />}
    </div>
  );
};

export default StartButton;
