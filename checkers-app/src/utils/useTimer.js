import { useEffect, useState } from 'react';

export default function useTimer(gameStarted, currentPlayer, playerRole, onTimeout) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  // Start timer when it's the player's turn
  useEffect(() => {
    if (gameStarted && currentPlayer === playerRole) {
      setTimeLeft(60);
      setTimerActive(true);
    } else {
      setTimerActive(false); // "STOP THE COUNT!"
    }
  }, [gameStarted, currentPlayer]);

  // Timer countdown
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); // 1 second interval
    } else if (timerActive && timeLeft === 0) {
      onTimeout(); // Time ran out, call onTimeout to handle it
      setTimerActive(false);
    }

    return () => clearTimeout(timer); // Clean up
  }, [timerActive, timeLeft, onTimeout]);

  return { timeLeft, timerActive, setTimerActive };
}