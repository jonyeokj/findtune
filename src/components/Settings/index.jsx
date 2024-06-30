import React from 'react';
import './styles.css';
import { useGlobalState } from '@/contexts/AppContext';
import SkipButton from '@/components/SkipButton';

const SettingsModal = ({ onClose }) => {
  const { skipMode, setSkipMode } = useGlobalState();

  const toggleSkipMode = () => setSkipMode(!skipMode);

  return (
    <div className='settings-modal'>
      <h2>Settings</h2>
      <div className='settings-controls'>
        <div className='skip-button-settings'>
          <span className='skip-on-like-text'>Skip on Like</span>
          <SkipButton skipMode={skipMode} toggleSkipMode={toggleSkipMode} />
        </div>
      </div>
      <div className='button-container'>
        <button onClick={onClose} className='standard-button'>
          Close
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
