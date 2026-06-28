import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sakura Tanaka',
    role: 'Anime Enthusiast',
    content: 'Amazing quality and design! The neon aesthetic is incredible.',
    rating: 5,
    avatar: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?w=100&h=100&fit=crop',
  },
  {
    id: 2,
    name: 'Kenji Yamamoto',
    role: 'Poster Collector',
    content: 'Best spot for anime posters and stickers. Highly recommend!',
    rating: 5,
    avatar: 'https://images.pexels.com/photos/3807497/pexels-photo-3807497.jpeg?w=100&h=100&fit=crop',
  },
  {
    id: 3,
    name: 'Yuki Sato',
    role: 'Collector',
    content: 'Premium quality and fast shipping. Love the exclusive designs!',
    rating: 5,
    avatar: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?w=100&h=100&fit=crop',
  },
];

export function Testimonials() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-red/5 to-transparent opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-red to-light-pink mb-4">
            Customer Love
          </h2>
          <p className="text-silver-white/70 text-lg">
            Loved by anime fans worldwide
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group relative bg-gradient-to-b from-matte-black/80 to-black rounded-xl border border-primary-red/30 hover:border-primary-red/60 transition-all duration-300 p-8"
            >
              <div className="absolute inset-0 bg-primary-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full border border-primary-red/30"
                  />
                  <div>
                    <h3 className="font-bold text-silver-white">{testimonial.name}</h3>
                    <p className="text-silver-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-primary-red text-primary-red"
                    />
                  ))}
                </div>

                <p className="text-silver-white/80 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>

              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-red to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
