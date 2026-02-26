import React, { useEffect, useState } from 'react';
import './Timer.css';

type TimerProps = {
  startMinutes?: number; // default 25
  isRunning?: boolean;
};

const Timer: React.FC<TimerProps> = ({
  startMinutes = 25,
  isRunning = true,
}) => {
  const initialSeconds = startMinutes * 60;

  const [secondsRemaining, setSecondsRemaining] =
    useState<number>(initialSeconds);

  useEffect(() => {
    if (!isRunning || secondsRemaining <= 0) return;

    const intervalId = window.setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning, secondsRemaining]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(
    seconds
  ).padStart(2, '0')}`;

  return (
    <div className={`timer ${secondsRemaining === 0 ? 'finished' : ''}`}>
      {formattedTime}
    </div>
  );
};

export default Timer;
