import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { formatINR } from '../utils/currency';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Sakura Night Poster',
    animeName: 'Naruto',
    price: 24.99,
    discountPrice: 0,
    image: 'https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg?w=400&h=400&fit=crop',
    category: 'Posters',
    type: 'poster',
    rating: 5,
    reviews: 124,
    description: 'Premium glossy poster with neon sakura design',
  },
  {
    id: '2',
    title: 'Anime Sticker Pack',
    animeName: 'One Piece',
    price: 9.99,
    discountPrice: 0,
    image: 'https://images.pexels.com/photos/3616956/pexels-photo-3616956.jpeg?w=400&h=400&fit=crop',
    category: 'Stickers',
    type: 'sticker',
    rating: 4.8,
    reviews: 342,
    description: 'Set of 50 premium holographic anime stickers',
  },
  {
    id: '3',
    title: 'Moonlight Poster',
    animeName: 'Demon Slayer',
    price: 27.99,
    discountPrice: 0,
    image: 'https://images.pexels.com/photos/14013402/pexels-photo-14013402.jpeg?w=400&h=400&fit=crop',
    category: 'Posters',
    type: 'poster',
    rating: 4.9,
    reviews: 210,
    description: 'Limited edition anime poster with moonlit cityscape',
  },
];

interface LiveSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LiveSearch({ isOpen, onClose }: LiveSearchProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return MOCK_PRODUCTS.filter(
      (product) =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.animeName.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-matte-black border border-primary-red/30 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-primary-red/30">
                <Search className="w-5 h-5 text-primary-red" />
                <input
                  type="text"
                  placeholder="Search products, categories..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent text-silver-white placeholder-silver-white/50 outline-none"
                />
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-primary-red/20 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-silver-white" />
                </button>
              </div>

              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-80 overflow-y-auto">
                      {results.map((product, index) => (
                        <motion.a
                          key={product.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          href="#"
                          className="flex gap-3 px-4 py-3 hover:bg-primary-red/10 border-b border-primary-red/20 transition-colors"
                        >
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-silver-white font-semibold text-sm">
                              {product.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-silver-white/60">
                              <span>{product.category}</span>
                              <span>•</span>
                              <span>{formatINR(product.price)}</span>
                            </div>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {query && results.length === 0 && (
                <div className="px-4 py-8 text-center text-silver-white/60">
                  No products found for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
