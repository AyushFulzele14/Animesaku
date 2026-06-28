import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Logo } from './Logo';

export function Hero() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">



      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-4 max-w-4xl"
      >
        <motion.div variants={item} className="mb-6">
          <div className="inline-block">
            <Logo size="hero" showGlow animated />
          </div>
        </motion.div>

        <motion.p
          variants={item}
          className="text-lg md:text-2xl text-silver-white/80 mb-8 font-light"
        >
          Premium Anime Posters & Stickers
        </motion.p>

        <motion.p
          variants={item}
          className="text-sm md:text-base text-silver-white/60 mb-10"
        >
          Discover exclusive posters and stickers with neon aesthetics and premium quality
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col md:flex-row gap-6 justify-center mb-12"
        >
          <motion.a
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 40px rgba(238, 16, 16, 0.8)',
            }}
            whileTap={{ scale: 0.95 }}
            href="#shop"
            className="px-10 py-4 bg-primary-red text-white font-bold rounded-lg hover:bg-dark-red transition-colors duration-300 shadow-neon-red text-lg inline-flex items-center justify-center"
          >
            Browse Posters
          </motion.a>

          <motion.a
            whileHover={{
              scale: 1.05,
              borderColor: '#ee1010',
            }}
            whileTap={{ scale: 0.95 }}
            href="#shop"
            className="px-10 py-4 border-2 border-primary-red/50 text-primary-red font-bold rounded-lg hover:border-primary-red transition-colors duration-300 text-lg inline-flex items-center justify-center"
          >
            Shop Stickers
          </motion.a>
        </motion.div>

        <motion.div
          variants={item}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center"
        >
          <ChevronDown className="w-8 h-8 text-primary-red animate-pulse" />
        </motion.div>
      </motion.div>
    </section>
  );
}
