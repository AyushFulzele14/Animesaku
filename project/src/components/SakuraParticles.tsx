import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

export function SakuraParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-pulse"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #FFB1D2 0%, rgba(255, 177, 210, 0.3) 100%)',
            boxShadow: '0 0 8px rgba(255, 177, 210, 0.6)',
            animation: `float ${particle.duration}s infinite ease-in-out`,
            animationDelay: `${particle.delay}s`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}
