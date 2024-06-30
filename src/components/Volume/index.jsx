import React, { useState, useCallback, useEffect, useRef } from 'react';
import './styles.css';
import { useAuth } from '@/contexts/AuthContext';
import { useSpotify } from '@/contexts/SpotifyContext';
import debounce from '@/utils/debounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeLow, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import config from '@/config';

const VolumeControl = () => {
  const { deviceId } = useSpotify();
  const [volume, setVolume] = useState(50);
  const [prevVolume, setPrevVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const { customFetch } = useAuth();
  const sliderRef = useRef(null);

  const updateVolume = async (newVolume) => {
    if (!deviceId) {
      console.error('Device ID not available.');
      return;
    }

    try {
      const response = await customFetch(`${config.API_BASE_URL}/api/volume`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ volume: newVolume, deviceId }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to set volume');
      }

      console.log('Volume set successfully');
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateVolume = useCallback(debounce(updateVolume, 300), [
    deviceId,
  ]);

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);

    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
      setPrevVolume(newVolume);
    }

    debouncedUpdateVolume(newVolume);
    updateSliderBackground(newVolume);
  };

  const handleIconClick = () => {
    if (isMuted) {
      setVolume(prevVolume);
      debouncedUpdateVolume(prevVolume);
      updateSliderBackground(prevVolume);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      debouncedUpdateVolume(0);
      updateSliderBackground(0);
    }
    setIsMuted(!isMuted);
  };

  const updateSliderBackground = (value) => {
    const slider = sliderRef.current;
    slider.style.setProperty('--value', `${value}%`);
  };

  useEffect(() => {
    updateSliderBackground(volume);
  }, [volume]);

  return (
    <div className='volume-control'>
      <FontAwesomeIcon
        icon={volume === 0 || isMuted ? faVolumeXmark : faVolumeLow}
        className={`volume-icon ${isMuted ? 'muted' : ''}`}
        onClick={handleIconClick}
      />
      <input
        type='range'
        id='volume'
        name='volume'
        min='0'
        max='100'
        value={volume}
        onChange={handleVolumeChange}
        className='volume-slider'
        ref={sliderRef}
      />
    </div>
  );
};

export default VolumeControl;
