import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to track active call duration in seconds and format as HH:MM:SS
 */
export const useCallTimer = (isActive = false) => {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const resetTimer = () => {
    setSeconds(0);
  };

  const formatTimer = () => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (num) => String(num).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  return {
    rawSeconds: seconds,
    formattedTime: formatTimer(),
    resetTimer,
  };
};

export default useCallTimer;
