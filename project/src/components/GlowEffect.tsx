import { motion } from 'framer-motion';

interface GlowEffectProps {
  children: React.ReactNode;
  color?: 'red' | 'pink';
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
}

export function GlowEffect({
  children,
  color = 'red',
  intensity = 'medium',
  animated = true,
}: GlowEffectProps) {
  const colorMap = {
    red: {
      low: '0 0 10px rgba(238, 16, 16, 0.3)',
      medium: '0 0 20px rgba(238, 16, 16, 0.6)',
      high: '0 0 40px rgba(238, 16, 16, 0.8)',
    },
    pink: {
      low: '0 0 10px rgba(255, 177, 210, 0.3)',
      medium: '0 0 20px rgba(255, 177, 210, 0.6)',
      high: '0 0 40px rgba(255, 177, 210, 0.8)',
    },
  };

  const boxShadow = colorMap[color][intensity];

  if (animated) {
    return (
      <motion.div
        animate={{
          boxShadow: [
            boxShadow,
            boxShadow.replace('0.6', '0.8'),
            boxShadow,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ boxShadow }}
      >
        {children}
      </motion.div>
    );
  }

  return <div style={{ boxShadow }}>{children}</div>;
}
