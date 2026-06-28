import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { api, resolveAssetUrl } from '../lib/api';

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

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async (refresh = false) => {
    try {
      setError(null);
      const query = refresh
        ? `/products?limit=50&sort=-createdAt&refresh=true&_=${Date.now()}`
        : '/products?limit=50&sort=-createdAt';
      const raw = await api.get<unknown>(query);
      const list = normalizeProductList(raw);

      const mapped: Product[] = list.map((item) => {
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
          featured: item.featured,
          trending: item.trending,
        };
      });
      setProducts(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();

    const refresh = () => {
      setLoading(true);
      void loadProducts(true);
    };

    window.addEventListener('product-created', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('product-created', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [loadProducts]);

  return { products, loading, error, reloadProducts: () => loadProducts(true) };
}
