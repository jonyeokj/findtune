import React, { useState } from 'react';
import './styles.css';
import '@/App.css';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalState } from '@/contexts/AppContext';
import Modal from '@/components/Modal';
import Empty from '@/components/Empty';
import config from '@/config';

const Playlist = () => {
  const { customFetch } = useAuth();
  const { likedSongs, setLikedSongs, selectedSongs, setSelectedSongs } =
    useGlobalState();
  const [modalContent, setModalContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUnlikeSong = (songId) => {
    setLikedSongs((prevLikedSongs) =>
      prevLikedSongs.filter((song) => song.id !== songId),
    );
  };

  const handleSelectSong = (song) => {
    if (selectedSongs.length >= 5) {
      setModalContent('You can only select up to 5 songs.');
      setIsModalOpen(true);
      return;
    }
    if (selectedSongs.some((selectedSong) => selectedSong.id === song.id)) {
      setModalContent('This song has already been added.');
      setIsModalOpen(true);
      return;
    }
    setSelectedSongs((prevSongs) => [...prevSongs, song]);
  };

  const handleSaveAsPlaylist = async () => {
    if (likedSongs.length === 0) {
      setModalContent('No liked songs to save.');
      setIsModalOpen(true);
      return;
    }

    try {
      // Create or get existing playlist
      const playlistResponse = await customFetch(
        `${config.API_BASE_URL}/create-playlist`,
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Findtune' }),
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      );

      const { id: playlistId } = await playlistResponse.json();

      // Add tracks to the playlist
      for (const song of likedSongs) {
        const uri = song.uri;
        await customFetch(
          `${
            config.API_BASE_URL
          }/add-track?playlistId=${playlistId}&uri=${encodeURIComponent(uri)}`,
          {
            method: 'POST',
            credentials: 'include',
          },
        );
      }

      setModalContent('Liked songs saved to playlist!');
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to save as playlist:', error);
      setModalContent('Failed to save as playlist');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent('');
  };

  return (
    <div className='liked-songs-container'>
      <div className='liked-songs-header'>Liked Songs</div>
      <div className='table-header'>
        <div>#</div>
        <div>Song</div>
        <div>Artist</div>
        <div></div>
      </div>
      {likedSongs.length === 0 ? (
        <Empty content='You have no liked songs.' />
      ) : (
        <div className='songs-list'>
          {likedSongs.map((song, index) => (
            <div key={song.id} className='liked-song-item'>
              <div className='song-index'>{index + 1}</div>
              <div className='song-info'>
                <div className='song-name'>{song.name}</div>
              </div>
              <div className='song-artist'>
                {song.artists.map((artist) => artist.name).join(', ')}
              </div>
              <button
                onClick={() => handleSelectSong(song)}
                className='seed-button'
              >
                Seed
              </button>
              <button
                onClick={() => handleUnlikeSong(song.id)}
                className='unlike-button'
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <div className='playlist-button-container'>
        <button onClick={handleSaveAsPlaylist} className='playlist-button'>
          Save as Playlist
        </button>
      </div>
      {isModalOpen && <Modal content={modalContent} onClose={closeModal} />}
    </div>
  );
};

export default Playlist;
