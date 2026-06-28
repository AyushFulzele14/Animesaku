import { useEffect, useRef } from 'react';

interface ParticlesProps {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  color: string;
  sizeMultiplier: number;
}

export function Particles({
  particleCount = 430,
  particleSpread = 6,
  speed = 0.1,
  particleColors = ['#fb0000'],
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Initialize particles in 3D space
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      // Random coordinates between -spread and +spread
      const x = (Math.random() - 0.5) * particleSpread * 150;
      const y = (Math.random() - 0.5) * particleSpread * 150;
      const z = (Math.random() - 0.5) * particleSpread * 150;
      
      const sizeMultiplier = 1 - Math.random() * sizeRandomness;
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];

      particles.push({ x, y, z, color, sizeMultiplier });
    }

    // Animation state
    let angleX = 0;
    let angleY = 0;

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left - width / 2;
      mouseRef.current.y = e.clientY - rect.top - height / 2;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    if (moveParticlesOnHover) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Orbit angles
      if (!disableRotation) {
        angleX += speed * 0.005;
        angleY += speed * 0.008;
      }

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Project and draw particles
      particles.forEach((particle) => {
        // 3D rotation
        // Y-axis rotation
        let x1 = particle.x * cosY - particle.z * sinY;
        let z1 = particle.z * cosY + particle.x * sinY;

        // X-axis rotation
        let y2 = particle.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + particle.y * sinX;

        // Mouse hover interaction
        if (moveParticlesOnHover && mouseRef.current.active) {
          const dx = x1 - mouseRef.current.x;
          const dy = y2 - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) * 0.08 * particleHoverFactor;
            x1 += (dx / dist) * force;
            y2 += (dy / dist) * force;
          }
        }

        // Perspective projection
        // We offset z by cameraDistance * 100 to keep it in front of the camera
        const zOffset = z2 + cameraDistance * 120;
        if (zOffset <= 0) return; // Behind camera

        const perspectiveScale = (cameraDistance * 100) / zOffset;
        const screenX = x1 * perspectiveScale + width / 2;
        const screenY = y2 * perspectiveScale + height / 2;

        // Skip if outside canvas
        if (screenX < 0 || screenX > width || screenY < 0 || screenY > height) return;

        // Calculate size based on perspective and base size
        // Dividing baseSize by 25 to match typical visual expectations
        const radius = (particleBaseSize / 25) * perspectiveScale * particle.sizeMultiplier;
        if (radius <= 0) return;

        // Draw particle
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);

        // Alpha calculation
        let alpha = 1;
        if (alphaParticles) {
          alpha = Math.max(0.1, Math.min(1, perspectiveScale));
        }

        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        
        // Add a subtle radial gradient to make them look like soft glowing points
        const gradient = ctx.createRadialGradient(
          screenX,
          screenY,
          0,
          screenX,
          screenY,
          radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, particle.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [
    particleCount,
    particleSpread,
    speed,
    particleColors,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
  ]);

  return <canvas ref={canvasRef} className="w-full h-full block bg-transparent" />;
}
