import { motion } from 'framer-motion';
import { Instagram, Mail } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black border-t border-primary-red/30 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary-red/5 to-transparent opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
        >
          <div>
            <Logo size="large" showGlow={false} className="mb-4" />
            <p className="text-silver-white/70">
              Premium anime posters and stickers with Japanese cyberpunk aesthetics
            </p>
          </div>

          <div>
            <h4 className="font-bold text-silver-white mb-4 text-lg">Shop</h4>
            <ul className="space-y-2 text-silver-white/70">
              <li>
                <a href="#shop" className="hover:text-primary-red transition-colors duration-300">
                  Posters
                </a>
              </li>
              <li>
                <a href="#shop" className="hover:text-primary-red transition-colors duration-300">
                  Stickers
                </a>
              </li>
              <li>
                <a href="#shop" className="hover:text-primary-red transition-colors duration-300">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#shop" className="hover:text-primary-red transition-colors duration-300">
                  Best Sellers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-silver-white mb-4 text-lg">Support</h4>
            <ul className="space-y-2 text-silver-white/70">
              <li>
                <a href="mailto:Animysaku@gmail.com" className="hover:text-primary-red transition-colors duration-300">
                  Animysaku@gmail.com
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary-red transition-colors duration-300">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#returns" className="hover:text-primary-red transition-colors duration-300">
                  Returns
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary-red transition-colors duration-300">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-silver-white mb-4 text-lg">Legal</h4>
            <ul className="space-y-2 text-silver-white/70">
              <li>
                <a href="#privacy" className="hover:text-primary-red transition-colors duration-300">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-primary-red transition-colors duration-300">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-primary-red transition-colors duration-300">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-primary-red/30"
        >
          <p className="text-silver-white/60 mb-6 md:mb-0">
            Copyright {currentYear} ANIMYSAKU STORE. All rights reserved.
          </p>

          <div className="flex gap-6">
            <motion.a
              whileHover={{ scale: 1.2, color: '#ee1010' }}
              href="https://www.instagram.com/animysaku.store?igsh=MTRpaHA0Mnk4dmY4cQ=="
              target="_blank"
              rel="noreferrer"
              className="text-silver-white/70 transition-colors duration-300"
            >
              <Instagram className="w-6 h-6" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.2, color: '#ee1010' }}
              href="mailto:Animysaku@gmail.com"
              className="text-silver-white/70 transition-colors duration-300"
            >
              <Mail className="w-6 h-6" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
