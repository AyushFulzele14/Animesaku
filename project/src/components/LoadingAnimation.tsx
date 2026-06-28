import { motion } from 'framer-motion';

export function LoadingAnimation() {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const dotVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          variants={containerVariants}
          animate="animate"
          className="flex gap-2 justify-center mb-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              variants={dotVariants}
              className="w-3 h-3 rounded-full bg-primary-red"
              style={{
                boxShadow: '0 0 10px rgba(238, 16, 16, 0.8)',
              }}
            />
          ))}
        </motion.div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <div className="w-16 h-16 border-2 border-primary-red/30 border-t-primary-red rounded-full" />
        </motion.div>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-silver-white mt-8 text-sm font-semibold tracking-widest"
        >
          LOADING...
        </motion.p>

        <motion.div
          animate={{ scaleX: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-20 h-0.5 bg-gradient-to-r from-transparent via-primary-red to-transparent mx-auto mt-6"
        />

        <p className="text-primary-red mt-8 text-xs font-bold">
          ✦ ANIMYSAKU STORE ✦
        </p>
      </div>
    </div>
  );
}
