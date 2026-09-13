import { useState, useEffect } from 'react';

/**
 * Hook to manage countdown timer for stock reservation.
 */
export const useCountdown = (targetDate, onExpire) => {
  const calculateTimeLeft = () => {
    if (!targetDate) return 0;
    const difference = new Date(targetDate).getTime() - new Date().getTime();
    return Math.max(0, Math.floor(difference / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setSecondsLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    secondsLeft,
    formattedTime,
    isExpired: secondsLeft <= 0,
  };
};
