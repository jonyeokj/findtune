import React from 'react';
import './styles.css';
import { useGlobalState } from '@/contexts/AppContext';

const SkipButton = () => {
  const { skipMode, setSkipMode } = useGlobalState();

  const toggleSkipMode = () => setSkipMode(!skipMode);

  return (
    <div className='skip-button-container'>
      <label className='switch'>
        <input type='checkbox' checked={skipMode} onChange={toggleSkipMode} />
        <span className='slider round'></span>
      </label>
    </div>
  );
};

export default SkipButton;
