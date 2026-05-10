import { useEffect, useRef, useState } from "react";
import { Particle } from "../_types";

const PARTICLE_COLORS = ["#eab308", "#fbbf24", "#f59e0b", "#ffffff", "#fde68a", "#facc15"];

function generateParticles(): Particle[] {
  return Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * 360 + (Math.random() - 0.5) * 25;
    const distance = 80 + Math.random() * 80;
    const rad = (angle * Math.PI) / 180;
    return {
      id: Date.now() + i,
      x: Math.cos(rad) * distance,
      y: Math.sin(rad) * distance,
      size: 8 + Math.random() * 9,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      duration: 0.9 + Math.random() * 0.3,
    };
  });
}

export function useScoreAnimation(score: number) {
  const prevScore = useRef(0);
  const [flash, setFlash] = useState<{ delta: number; key: number } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (score > prevScore.current) {
      const delta = score - prevScore.current;
      setFlash({ delta, key: Date.now() });
      setParticles(generateParticles());
      setTimeout(() => {
        setFlash(null);
        setParticles([]);
      }, 2000);
    }
    prevScore.current = score;
  }, [score]);

  return { flash, particles };
}