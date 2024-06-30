import React, { useEffect } from 'react';
import '@/App.css';
import './styles.css';
import './skeleton.css';
import VolumeControl from '@/components/Volume';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faBan,
  faHeart,
} from '@fortawesome/free-solid-svg-icons';
import { useSpotify } from '@/contexts/SpotifyContext';
import { useGlobalState } from '@/contexts/AppContext';
import OverflowText from '@/components/OverflowText';

const Player = () => {
  const { currentTrack, play, pause, fetchAndPlayRecommendation, deviceId } =
    useSpotify();
  const {
    selectedSongs,
    isPlaying,
    setIsPlaying,
    setHasStarted,
    setLikedSongs,
    skipMode,
  } = useGlobalState();

  const togglePlayback = async () => {
    if (!deviceId) {
      console.error('No device ID available');
      return;
    }

    if (isPlaying) {
      await pause();
      setIsPlaying(false);
    } else {
      await play();
      setIsPlaying(true);
    }
  };

  const handleSkip = async () => {
    await pause();
    if (selectedSongs.length === 0) {
      setHasStarted(false);
    }

    const seedTracks = selectedSongs.map((song) => song.id).join(',');
    fetchAndPlayRecommendation(seedTracks);
  };

  const handleLike = async () => {
    if (currentTrack) {
      setLikedSongs((prevLikedSongs) => {
        if (
          prevLikedSongs.some((likedSong) => likedSong.id === currentTrack.id)
        ) {
          return prevLikedSongs;
        }
        return [...prevLikedSongs, currentTrack];
      });

      const seedTracks = selectedSongs.map((song) => song.id).join(',');
      if (skipMode) {
        await pause();
        if (selectedSongs.length === 0) {
          setHasStarted(false);
        }

        fetchAndPlayRecommendation(seedTracks);
      }
    }
  };

  useEffect(() => {
    if (!selectedSongs.length && !currentTrack) {
      setHasStarted(false);
    }
  }, [currentTrack, selectedSongs, setHasStarted]);

  return (
    <div className='player-container'>
      {!currentTrack ? (
        <div className='track-control-container'>
          <div className='skeleton-image-container'>
            <div className='skeleton skeleton-track-image'></div>
          </div>
          <div className='track-info-controls'>
            <div className='track-details'>
              <div className='skeleton skeleton-track-name'></div>
              <div className='skeleton skeleton-artist-name'></div>
            </div>
            <div className='skeleton-controls'>
              <div className='skeleton skeleton-circle-button'></div>
              <div className='skeleton skeleton-circle-button'></div>
              <div className='skeleton skeleton-circle-button'></div>
            </div>
            <div className='skeleton skeleton-skip-button'></div>
          </div>
        </div>
      ) : (
        <div className='track-control-container'>
          <img
            src={currentTrack.album.images[0].url}
            alt={currentTrack.name}
            className='track-image'
          />
          <div className='track-info-controls'>
            <div className='track-details'>
              <OverflowText text={currentTrack.name} className='track-name' />
              <OverflowText
                text={currentTrack.artists
                  .map((artist) => artist.name)
                  .join(', ')}
                className='artist-name'
              />
            </div>
            <div className='controls'>
              <button
                onClick={handleSkip}
                className='circle-button skip-button'
              >
                <FontAwesomeIcon icon={faBan} />
              </button>
              <button
                onClick={togglePlayback}
                className='circle-button play-pause-button'
              >
                {isPlaying ? (
                  <FontAwesomeIcon icon={faPause} />
                ) : (
                  <FontAwesomeIcon icon={faPlay} />
                )}
              </button>
              <button
                onClick={handleLike}
                className='circle-button like-button'
              >
                <FontAwesomeIcon icon={faHeart} />
              </button>
            </div>
            <VolumeControl />
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
