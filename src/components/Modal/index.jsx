import React from 'react';
import './styles.css';

const Modal = ({ content, onClose, disableClose, modalWidth }) => {
  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleBackgroundClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const modalContentStyle = {
    width: modalWidth || '30%',
    maxWidth: '500px',
  };

  return (
    <div className='modal' onClick={handleBackgroundClick}>
      <div className='modal-content' style={modalContentStyle}>
        {!disableClose && (
          <span className='close' onClick={handleClose}>
            &times;
          </span>
        )}
        {content}
      </div>
    </div>
  );
};

export default Modal;
