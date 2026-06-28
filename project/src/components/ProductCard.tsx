import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types';
import { Logo } from './Logo';
import { WishlistButton } from './WishlistButton';
import { useState } from 'react';
import { formatINR } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  index?: number;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, index = 0, onAddToCart }: ProductCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height - 0.5;
    const y = (e.clientX - rect.left) / rect.width - 0.5;
    setRotateX(x * 15);
    setRotateY(y * -15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        rotateX: `${rotateX}deg`,
        rotateY: `${rotateY}deg`,
        transition: 'all 0.3s ease-out',
      } as React.CSSProperties}
      className="group relative bg-gradient-to-b from-matte-black/80 to-black rounded-xl overflow-hidden border border-primary-red/30 hover:border-primary-red/60 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div 
        className="relative overflow-hidden bg-black h-64 cursor-pointer"
        onClick={() => window.dispatchEvent(new CustomEvent('open-product-details', { detail: { productId: product.id } }))}
      >
        <motion.img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10 pointer-events-none flex items-center justify-center">
          <Logo size="large" showGlow={false} />
        </div>

        {product.discountPrice && product.discountPrice > 0 && (
          <div className="absolute top-4 right-4 bg-primary-red px-3 py-1 rounded-full text-white text-sm font-bold">
            Sale
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4" onClick={(e) => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onAddToCart?.(product)}
            className="bg-primary-red/80 hover:bg-primary-red p-3 rounded-full transition-colors duration-300"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
          </motion.button>
          <WishlistButton productId={product.id} productName={product.title} />
        </div>
      </div>

      <div className="p-5 relative z-10">
        <h3 
          onClick={() => window.dispatchEvent(new CustomEvent('open-product-details', { detail: { productId: product.id } }))}
          className="font-bold text-silver-white text-lg mb-2 line-clamp-1 group-hover:text-primary-red transition-colors duration-300 cursor-pointer"
        >
          {product.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-primary-red text-primary-red'
                    : 'text-silver-white/30'
                }`}
              />
            ))}
          </div>
          <span className="text-silver-white/60 text-sm">({product.reviews})</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {product.discountPrice && product.discountPrice > 0 ? (
            <>
              <span className="text-lg font-bold text-primary-red">
                {formatINR(product.discountPrice)}
              </span>
              <span className="text-sm text-silver-white/50 line-through">
                {formatINR(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-silver-white">
              {formatINR(product.price)}
            </span>
          )}
        </div>

        <p className="text-silver-white/60 text-sm line-clamp-2 mb-4">
          {product.description}
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAddToCart?.(product)}
          className="w-full bg-gradient-to-r from-primary-red to-dark-red hover:shadow-neon-red text-white font-bold py-2 rounded-lg transition-all duration-300"
        >
          Add to Cart
        </motion.button>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-primary-red/0 via-primary-red/5 to-primary-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}
