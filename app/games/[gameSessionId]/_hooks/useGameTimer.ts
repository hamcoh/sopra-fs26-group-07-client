import { useEffect, useState } from "react";

export function useGameTimer(gameEndTime: number | null): number | null {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (gameEndTime === null) return;
    const tick = () => {
      const remaining = Math.max(0, Math.floor((gameEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [gameEndTime]);

  return timeLeft;
}