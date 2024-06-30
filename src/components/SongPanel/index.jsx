import React, { useEffect } from 'react';
import './styles.css';
import { useGlobalState } from '@/contexts/AppContext';
import { useSpotify } from '@/contexts/SpotifyContext';
import OverflowText from '@/components/OverflowText';
import Empty from '@/components/Empty';

const SongPanel = () => {
  const { updateSelectedSongs } = useSpotify();
  const { selectedSongs, setSelectedSongs } = useGlobalState();

  useEffect(() => {
    updateSelectedSongs(selectedSongs);
  }, [selectedSongs, updateSelectedSongs]);

  const handleRemoveSong = (songId) => {
    setSelectedSongs((prevSongs) =>
      prevSongs.filter((song) => song.id !== songId),
    );
  };

  return (
    <div className='song-panel'>
      {selectedSongs.length === 0 ? (
        <Empty content='Your seeded songs appear here.' />
      ) : (
        selectedSongs.map((song) => {
          const imageUrl = song.album.images[0]?.url;
          const artistNames = song.artists
            .map((artist) => artist.name)
            .join(', ');

          return (
            <div
              key={song.id}
              className='song-item'
              onClick={() => handleRemoveSong(song.id)}
            >
              <img
                src={imageUrl}
                alt={song.name}
                style={{ width: '100px', height: '100px' }}
              />
              <OverflowText text={song.name} />
              <OverflowText text={artistNames} />
            </div>
          );
        })
      )}
    </div>
  );
};

export default SongPanel;
