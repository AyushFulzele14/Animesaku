import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { Product } from '../types';

export function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockRecommendations: Product[] = [
      {
        id: '7',
        title: 'Aurora Poster',
        animeName: 'Jujutsu Kaisen',
        price: 26.99,
        discountPrice: 21.99,
        image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?w=400&h=400&fit=crop',
        category: 'Posters',
        type: 'poster',
        rating: 4.8,
        reviews: 143,
        description: 'Anime poster with glowing aurora city scene',
      },
      {
        id: '8',
        title: 'Retro Sticker Sheet',
        animeName: 'Attack on Titan',
        price: 11.99,
        discountPrice: 0,
        image: 'https://images.pexels.com/photos/1208077/pexels-photo-1208077.jpeg?w=400&h=400&fit=crop',
        category: 'Stickers',
        type: 'sticker',
        rating: 4.7,
        reviews: 197,
        description: 'High-quality anime sticker sheet with retro neon designs',
      },
      {
        id: '9',
        title: 'Dreamscape Poster',
        animeName: 'Your Name',
        price: 29.99,
        discountPrice: 0,
        image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?w=400&h=400&fit=crop',
        category: 'Posters',
        type: 'poster',
        rating: 4.9,
        reviews: 212,
        description: 'Limited edition dreamscape anime poster',
      },
    ];

    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center gap-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{ delay: i * 0.2, duration: 1.5, repeat: Infinity }}
            className="w-32 h-40 bg-gradient-to-br from-primary-red/20 to-dark-red/20 rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-red to-light-pink mb-4">
            AI Recommendations
          </h2>
          <p className="text-silver-white/70 text-lg">
            Personalized poster and sticker picks just for you
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
