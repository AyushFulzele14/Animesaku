import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { themeConfig } from '../config/theme';

type ShopCategory = 'All' | 'Posters' | 'Stickers';

interface CollectionsProps {
  onSelectCategory?: (category: ShopCategory) => void;
}

const mapCollectionToCategory = (name: string): ShopCategory => {
  const normalized = name.toLowerCase();
  if (normalized.includes('poster')) return 'Posters';
  if (normalized.includes('sticker')) return 'Stickers';
  return 'All';
};

export function Collections({ onSelectCategory }: CollectionsProps) {
  const handleSelect = (collectionName: string) => {
    const category = mapCollectionToCategory(collectionName);
    onSelectCategory?.(category);

    const shopSection = document.getElementById('shop');
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="collections" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
            Shop by Category
          </h2>
          <p className="text-silver-white/70 text-lg">
            Explore our curated poster and sticker collections
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {themeConfig.sections.collections.map((collection, index) => {
            const IconComponent = Icons[collection.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

            return (
              <motion.button
                key={collection.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 30px rgba(238, 16, 16, 0.6)',
                }}
                type="button"
                onClick={() => handleSelect(collection.name)}
                className="group relative"
              >
                <div className="aspect-square bg-gradient-to-br from-primary-red/10 to-dark-red/10 rounded-lg border border-primary-red/30 hover:border-primary-red/60 transition-all duration-300 flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-primary-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="relative z-10 mb-3"
                  >
                    {IconComponent && (
                      <IconComponent className="w-10 h-10 text-primary-red group-hover:text-light-pink transition-colors duration-300" />
                    )}
                  </motion.div>

                  <h3 className="text-center text-sm md:text-base font-bold text-silver-white group-hover:text-primary-red transition-colors duration-300 relative z-10">
                    {collection.name}
                  </h3>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-red to-transparent"
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
