import { useState, useEffect, useRef } from 'react';
import { Music, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

export function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleToggle = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(() => {
          console.log('Audio playback failed - browser may require user interaction');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('musicEnabled');
    if (saved === 'true' && audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {
        console.log('Audio playback failed - browser may require user interaction');
      });
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('musicEnabled', isPlaying.toString());
  }, [isPlaying]);

  return (
    <>
      <audio
        ref={audioRef}
        loop
        crossOrigin="anonymous"
      >
        <source
          src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
          type="audio/mpeg"
        />
      </audio>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="p-2 rounded-lg hover:bg-primary-red/20 transition-colors duration-300 relative"
        title={isPlaying ? 'Stop anime music' : 'Play anime music'}
      >
        <motion.div
          animate={{ rotate: isPlaying ? [0, 5, -5, 0] : 0 }}
          transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
        >
          {isPlaying ? (
            <Music className="w-5 h-5 text-primary-red" />
          ) : (
            <VolumeX className="w-5 h-5 text-silver-white" />
          )}
        </motion.div>

        {isPlaying && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="absolute inset-0 border border-primary-red rounded-lg"
          />
        )}
      </motion.button>
    </>
  );
}
