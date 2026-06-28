import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

export function PromoBanner() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-primary-red/20 to-dark-red/20 rounded-2xl border border-primary-red/40 overflow-hidden h-96"
        >
          <div className="absolute inset-0" />

          <div className="relative z-10 flex flex-col justify-center items-start h-full p-8 md:p-16">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-light-pink to-primary-red mb-4"
            >
              Poster & Sticker Drop
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-silver-white/80 text-lg md:text-xl mb-8 max-w-xl"
            >
              Exclusive anime posters and stickers with limited edition designs. Get up to 40% off selected pieces.
            </motion.p>

            <motion.a
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, x: 10 }}
              whileTap={{ scale: 0.95 }}
              href="#shop"
              className="flex items-center gap-3 px-8 py-4 bg-primary-red hover:bg-dark-red text-white font-bold rounded-lg transition-all duration-300"
            >
              Explore Now
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1/4 h-full opacity-15 pointer-events-none flex items-center justify-end pr-8"
          >
            <Logo size="large" showGlow={false} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
