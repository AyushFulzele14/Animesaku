import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { api, resolveAssetUrl } from '../lib/api';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: CartItem[];
  total: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const GUEST_CART_KEY = 'animysaku_guest_cart';

interface RawProduct {
  _id?: string;
  id?: string;
  title?: string;
  animeName?: string;
  price?: number | string;
  discountPrice?: number | string;
  images?: Array<{ url: string }>;
  image?: string;
  category?: string | { name?: string };
  type?: string;
  ratings?: number | string;
  numOfReviews?: number | string;
  description?: string;
  featured?: boolean;
  trending?: boolean;
}

interface RawCartItem {
  product?: RawProduct;
  quantity?: number;
}

function normalizeProduct(raw: RawProduct): Product {
  const categoryName =
    typeof raw.category === 'string'
      ? raw.category
      : raw.category?.name || raw.type || 'Unknown';

  return {
    id: raw._id ?? raw.id ?? '',
    title: raw.title ?? 'Unknown Product',
    animeName: raw.animeName ?? raw.title ?? 'Unknown Anime',
    price: Number(raw.price ?? 0),
    discountPrice: raw.discountPrice !== undefined ? Number(raw.discountPrice) : undefined,
    image: resolveAssetUrl(raw.images?.[0]?.url ?? raw.image),
    category: categoryName,
    type: raw.type === 'sticker' ? 'sticker' : 'poster',
    rating: Number(raw.ratings ?? 0),
    reviews: Number(raw.numOfReviews ?? 0),
    description: raw.description ?? '',
    featured: raw.featured,
    trending: raw.trending,
  };
}

function normalizeCartItems(items: RawCartItem[]): CartItem[] {
  return items.map((item) => ({
    product: normalizeProduct(item.product ?? {}),
    quantity: Number(item.quantity ?? 1),
  }));
}

function loadGuestCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Array<{ product: Product; quantity: number }>;
    return parsed.map((item) => ({
      product: item.product,
      quantity: Number(item.quantity ?? 1),
    }));
  } catch {
    return [];
  }
}

function saveGuestCart(cart: CartItem[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch {
    // ignore storage errors
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0),
    [cart]
  );

  const setCartAndPersist = useCallback(
    (nextCart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
      setCart((prev) => {
        const next = typeof nextCart === 'function' ? nextCart(prev) : nextCart;
        if (!isAuthenticated) {
          saveGuestCart(next);
        }
        return next;
      });
    },
    [isAuthenticated]
  );

  const loadCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const items = await api.get<RawCartItem[]>('/cart');
        setCart(normalizeCartItems(items));
        return;
      } catch {
        setCart(loadGuestCart());
        return;
      }
    }

    setCart(loadGuestCart());
  }, [isAuthenticated]);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((open) => !open), []);

  const addToCart = useCallback(
    async (product: Product) => {
      setCartAndPersist((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { product, quantity: 1 }];
      });

      if (isAuthenticated) {
        try {
          await api.post('/cart', { productId: product.id, quantity: 1 });
        } catch {
          // keep fallback cart state
        }
      }
    },
    [isAuthenticated, setCartAndPersist]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      setCartAndPersist((prev) => prev.filter((item) => item.product.id !== productId));
      if (isAuthenticated) {
        try {
          await api.delete(`/cart/${productId}`);
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated, setCartAndPersist]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      setCartAndPersist((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
      if (isAuthenticated) {
        try {
          await api.patch('/cart', { productId, quantity });
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated, setCartAndPersist]
  );

  const clearCart = useCallback(() => {
    setCartAndPersist([]);
  }, [setCartAndPersist]);

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
