// src/hooks/useParticles.ts
// Generates stable ambient background particle data on mount.

import { useState, useEffect } from "react";

export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
  opacity: number;
}

export function useParticles(count = 18): Particle[] {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id:      i,
        x:       Math.random() * 100,
        y:       Math.random() * 100,
        size:    2 + Math.random() * 3,
        dur:     4 + Math.random() * 6,
        delay:   Math.random() * 4,
        opacity: 0.05 + Math.random() * 0.1,
      }))
    );
  }, [count]);

  return particles;
}
