import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'hero';
  showGlow?: boolean;
  animated?: boolean;
  className?: string;
}

export function Logo({
  size = 'medium',
  showGlow = true,
  animated = false,
  className = '',
}: LogoProps) {
  const sizeMap = {
    small: 'h-8 w-auto',
    medium: 'h-12 w-auto',
    large: 'h-20 w-auto',
    hero: 'h-64 md:h-80 w-auto',
  };

  const Component = animated ? motion.img : 'img';

  return (
    <Component
      src="/logo png.png"
      alt="ANIMYSAKU STORE Logo"
      className={`${sizeMap[size]} object-contain ${className}`}
      style={
        showGlow
          ? {
              filter: `drop-shadow(0 0 ${size === 'hero' ? '30px' : '15px'} rgba(238, 16, 16, 0.6))`,
            }
          : undefined
      }
      animate={
        animated
          ? {
              y: [0, -10, 0],
            }
          : undefined
      }
      transition={
        animated
          ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          : undefined
      }
    />
  );
}
