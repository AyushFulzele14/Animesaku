import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <section id="newsletter" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-red/10 via-transparent to-primary-red/10 opacity-40 pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-matte-black/80 to-black rounded-xl border border-primary-red/30 p-8 md:p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-6"
          >
            <Mail className="w-12 h-12 text-primary-red mx-auto" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-red to-light-pink mb-4">
            Stay Updated
          </h2>

          <p className="text-silver-white/70 text-lg mb-8">
            Get exclusive deals, new releases, and anime content delivered to your inbox
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-black/50 border border-primary-red/30 focus:border-primary-red text-silver-white placeholder-silver-white/40 px-6 py-3 rounded-lg focus:outline-none transition-all duration-300"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitted}
              className="px-8 py-3 bg-primary-red hover:bg-dark-red disabled:opacity-50 text-white font-bold rounded-lg transition-all duration-300 shadow-neon-red"
            >
              {isSubmitted ? 'Subscribed!' : 'Subscribe'}
            </motion.button>
          </form>

          {isSubmitted && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-400 mt-4"
            >
              Thanks for subscribing!
            </motion.p>
          )}

          <p className="text-silver-white/50 text-sm mt-6">
            No spam, just premium anime content and exclusive offers
          </p>
        </motion.div>
      </div>
    </section>
  );
}
