import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { useProducts } from '../hooks';
import { useCart } from '../hooks';

type ShopCategory = 'All' | 'Posters' | 'Stickers';

interface FeaturedProductsProps {
  forcedCategory?: ShopCategory;
}

export function FeaturedProducts({ forcedCategory = 'All' }: FeaturedProductsProps) {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<ShopCategory>(forcedCategory);

  useEffect(() => {
    setActiveCategory(forcedCategory);
  }, [forcedCategory]);

  const categories: Array<ShopCategory> = ['All', 'Posters', 'Stickers'];

  const selectedCategory: ShopCategory = activeCategory;

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((product) => {
          const normalized = product.type === 'poster' ? 'Posters' : 'Stickers';
          return normalized === selectedCategory;
        });

  return (
    <section id="shop" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-red/5 via-transparent to-primary-red/5 opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-red to-light-pink mb-4">
            Shop Posters & Stickers
          </h2>
          <p className="text-silver-white/70 text-lg">
            Browse our curated anime poster and sticker collections.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-primary-red text-black shadow-neon-red'
                  : 'bg-matte-black/80 text-silver-white border border-primary-red/30 hover:bg-primary-red/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && <p className="text-silver-white/60 md:col-span-3">Loading products...</p>}
          {error && <p className="text-primary-red md:col-span-3">{error}</p>}
          {!loading && !error && filteredProducts.length === 0 && products.length > 0 && (
            <p className="text-silver-white/60 md:col-span-3">
              No {selectedCategory.toLowerCase()} in this view. Click <strong>All</strong> to see every product.
            </p>
          )}
          {!loading && !error && products.length === 0 && (
            <p className="text-silver-white/60 md:col-span-3">
              No products yet. Log in as admin and add products in the Admin section below.
            </p>
          )}
          {!loading &&
            !error &&
            filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} onAddToCart={addToCart} />
            ))}
        </div>
      </div>
    </section>
  );
}
