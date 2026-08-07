import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { formatINR } from '../utils/currency';
import { api, resolveAssetUrl } from '../lib/api';

interface LiveSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RawProduct {
  _id: string;
  title: string;
  animeName: string;
  price: number;
  discountPrice?: number;
  images?: Array<{ url: string }>;
  category?: { name?: string } | string;
  type: 'poster' | 'sticker';
  ratings: number;
  numOfReviews: number;
  description: string;
  featured?: boolean;
  trending?: boolean;
}

function normalizeProductList(data: unknown): RawProduct[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'products' in data && Array.isArray((data as { products: RawProduct[] }).products)) {
    return (data as { products: RawProduct[] }).products;
  }
  return [];
}

export function LiveSearch({ isOpen, onClose }: LiveSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const raw = await api.get<unknown>(`/products?keyword=${encodeURIComponent(query)}&limit=10`);
        const list = normalizeProductList(raw);
        const mapped = list.map((item) => {
          const categoryName =
            typeof item.category === 'string' ? item.category : item.category?.name || item.type;
          return {
            id: item._id,
            title: item.title,
            animeName: item.animeName,
            price: item.price,
            discountPrice: item.discountPrice,
            image: resolveAssetUrl(item.images?.[0]?.url),
            category: categoryName,
            type: item.type,
            rating: item.ratings || 0,
            reviews: item.numOfReviews || 0,
            description: item.description,
          };
        });
        setResults(mapped);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleProductClick = (productId: string) => {
    window.dispatchEvent(
      new CustomEvent('open-product-details', {
        detail: { productId },
      })
    );
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
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
                {loading && <Loader2 className="w-5 h-5 text-primary-red animate-spin" />}
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
                          onClick={(e) => {
                            e.preventDefault();
                            handleProductClick(product.id);
                          }}
                          className="flex gap-3 px-4 py-3 hover:bg-primary-red/10 border-b border-primary-red/20 transition-colors"
                        >
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-12 h-12 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg?w=400&h=400&fit=crop";
                            }}
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

              {query && !loading && results.length === 0 && (
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
