import React, { useRef, useEffect, useState } from 'react';
import './styles.css';

const OverflowText = ({ text, className = '' }) => {
  const textRef = useRef(null);
  const [isOverflowed, setIsOverflowed] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const current = textRef.current;
      if (current && current.scrollWidth > current.offsetWidth) {
        setIsOverflowed(true);
      } else {
        setIsOverflowed(false);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div
      className={`${className} overflow-text-container`}
      style={{ position: 'relative' }}
    >
      <span ref={textRef} className="text-content">
        {text}
      </span>
      {isOverflowed && <div className="custom-tooltip">{text}</div>}
    </div>
  );
};

export default OverflowText;
