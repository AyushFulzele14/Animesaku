import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

interface WishlistButtonProps {
  productId: string;
  productName?: string;
}

export function WishlistButton({ productId }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.includes(productId));
  }, [productId]);

  const handleToggle = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Backend uses POST /wishlist/:productId to toggle both adding and removing
      api.post(`/wishlist/${productId}`).catch(() => undefined);
    }

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let updated: string[];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id: string) => id !== productId);
      setIsWishlisted(false);
    } else {
      updated = [...wishlist, productId];
      setIsWishlisted(true);
    }
    localStorage.setItem('wishlist', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('wishlist-updated'));
  };

  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className={`p-2 rounded-full transition-colors duration-300 ${
        isWishlisted
          ? 'bg-primary-red text-white'
          : 'bg-primary-red/20 text-silver-white hover:bg-primary-red/30'
      }`}
      title={isWishlisted ? `Remove from wishlist` : `Add to wishlist`}
    >
      <motion.div
        animate={isWishlisted ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className="w-5 h-5"
          fill={isWishlisted ? 'currentColor' : 'none'}
        />
      </motion.div>
    </motion.button>
  );
}
