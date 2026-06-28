import { useEffect, useState } from 'react';

export function AnimeCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);

  useEffect(() => {
    let trailId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      setTrail((prev) => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: trailId++ }];
        return newTrail.slice(-15);
      });
    };

    const handleWindowLeave = () => {
      setIsVisible(false);
      setTrail([]);
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget || (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        handleWindowLeave();
      }
    };

    const handleWindowBlur = () => {
      handleWindowLeave();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  return (
    <>
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>

      {trail.map((point, index) => (
        <div
          key={point.id}
          className="fixed pointer-events-none"
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(238, 16, 16, ${0.6 - index * 0.04}), transparent)`,
            boxShadow: `0 0 ${10 - index * 0.5}px rgba(238, 16, 16, ${0.4 - index * 0.03})`,
            transform: 'translate(-4px, -4px)',
            zIndex: 9999,
          }}
        />
      ))}

      {isVisible && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: '2px solid #ee1010',
            boxShadow: '0 0 20px rgba(238, 16, 16, 0.8), inset 0 0 10px rgba(238, 16, 16, 0.4)',
            transform: 'translate(-6px, -6px)',
            zIndex: 9999,
          }}
        />
      )}

      {isVisible && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '1px solid rgba(238, 16, 16, 0.3)',
            transform: 'translate(-12px, -12px)',
            zIndex: 9998,
            animation: 'spin 3s linear infinite',
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: translate(-12px, -12px) rotate(0deg); }
          to { transform: translate(-12px, -12px) rotate(360deg); }
        }
      `}</style>
    </>
  );
}
