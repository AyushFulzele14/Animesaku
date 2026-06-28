import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart } from 'lucide-react';
import { useProducts, useCart } from '../hooks';
import { formatINR } from '../utils/currency';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WishlistModal({ isOpen, onClose }: WishlistModalProps) {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const loadWishlist = () => {
    const ids = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistIds(ids);
  };

  useEffect(() => {
    if (isOpen) {
      loadWishlist();
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener('wishlist-updated', loadWishlist);
    return () => {
      window.removeEventListener('wishlist-updated', loadWishlist);
    };
  }, []);

  const handleRemove = (productId: string) => {
    const updated = wishlistIds.filter((id) => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setWishlistIds(updated);
    
    // Notify other components & sync with backend if authenticated
    window.dispatchEvent(new CustomEvent('wishlist-updated'));
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      import('../lib/api').then(({ api }) => {
        api.post(`/wishlist/${productId}`).catch(() => undefined);
      });
    }
  };

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-matte-black border border-primary-red/30 rounded-2xl overflow-hidden shadow-neon-red max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary-red/20">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-red to-light-pink">
                Your Wishlist
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-primary-red/20 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-silver-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {wishlistedProducts.length === 0 ? (
                <div className="text-center py-12 text-silver-white/60">
                  Your wishlist is empty. Explore products to add some!
                </div>
              ) : (
                wishlistedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-4 items-center rounded-2xl border border-primary-red/20 p-4 bg-black/60 hover:border-primary-red/50 transition-all duration-300"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-20 w-20 rounded-xl object-cover border border-primary-red/10"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-silver-white">{product.title}</h3>
                      <p className="text-silver-white/60 text-sm">{product.animeName}</p>
                      <p className="text-primary-red font-bold mt-1">
                        {formatINR(product.discountPrice || product.price)}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end col-span-2 sm:col-span-1 mt-2 sm:mt-0">
                      <button
                        onClick={() => {
                          void addToCart(product);
                          handleRemove(product.id);
                        }}
                        className="flex items-center gap-2 bg-primary-red text-black px-4 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors duration-200"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="p-2 rounded-xl border border-primary-red/30 hover:bg-primary-red/10 text-silver-white transition-colors"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
