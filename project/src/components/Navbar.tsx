import { FormEvent, useEffect, useState } from 'react';
import { ShoppingCart, Heart, User, Menu, X, Package, Clipboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { LiveSearch } from './LiveSearch';
import { ThemeToggle } from './ThemeToggle';
import { MusicToggle } from './MusicToggle';
import { OrderHistory } from './OrderHistory';
import { WishlistModal } from './WishlistModal';
import { useAuth, useCart } from '../hooks';

interface NavbarProps {
  onAdminOrdersClick?: () => void;
}

export function Navbar({ onAdminOrdersClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const { user, signIn, signUp, signOut, isAdmin, error: authError } = useAuth();
  const { cart, toggleCart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  useEffect(() => {
    const syncWishlistCount = () => {
      try {
        const ids = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistCount(ids.length);
      } catch {
        setWishlistCount(0);
      }
    };
    syncWishlistCount();
    window.addEventListener('wishlist-updated', syncWishlistCount);
    return () => window.removeEventListener('wishlist-updated', syncWishlistCount);
  }, []);

  useEffect(() => {
    if (user && authModalOpen) setAuthModalOpen(false);
  }, [user, authModalOpen]);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
  };

  const [authSubmitting, setAuthSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setAuthSubmitting(true);
    try {
      await signIn(loginEmail, loginPassword);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignup = async (event: FormEvent) => {
    event.preventDefault();
    await signUp(signupName, signupEmail, signupPassword);
  };

  return (
    <>
      {showOrderHistory && <OrderHistory onClose={() => setShowOrderHistory(false)} />}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/40 border-b border-primary-red/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="#" className="flex items-center hover:opacity-80 transition-opacity duration-300">
            <Logo size="medium" showGlow={false} />
          </a>

            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-silver-white hover:text-primary-red transition-colors duration-300">
                Home
              </a>
              <a href="#shop" className="text-silver-white hover:text-primary-red transition-colors duration-300">
                Shop
              </a>
              <a href="#collections" className="text-silver-white hover:text-primary-red transition-colors duration-300">
                Collections
              </a>
              {isAdmin && (
                <a href="#admin" className="text-silver-white hover:text-primary-red transition-colors duration-300">
                  Admin
                </a>
              )}
              <a href="#newsletter" className="text-silver-white hover:text-primary-red transition-colors duration-300">
                Contact
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-primary-red/20 transition-colors duration-300"
              >
                <svg className="w-5 h-5 text-silver-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.button>

              <MusicToggle />
              <ThemeToggle />

              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setWishlistOpen(true)}
                className="relative p-2 rounded-lg hover:bg-primary-red/20 transition-colors duration-300"
                title="Wishlist"
              >
                <Heart className="w-6 h-6 text-silver-white" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                className="relative p-2 rounded-lg hover:bg-primary-red/20 transition-colors duration-300"
                onClick={toggleCart}
              >
                <ShoppingCart className="w-6 h-6 text-silver-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg hover:bg-primary-red/20 transition-colors duration-300"
                onClick={() => (user ? setAuthModalOpen(true) : openAuthModal('login'))}
              >
                <User className="w-6 h-6 text-silver-white" />
              </motion.button>

              {user && (
                <>
                  {isAdmin && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={onAdminOrdersClick}
                      className="p-2 rounded-lg hover:bg-primary-red/20 transition-colors duration-300"
                      title="Admin Orders"
                    >
                      <Clipboard className="w-6 h-6 text-primary-red" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setShowOrderHistory(true)}
                    className="p-2 rounded-lg hover:bg-primary-red/20 transition-colors duration-300"
                    title="Order History"
                  >
                    <Package className="w-6 h-6 text-silver-white" />
                  </motion.button>
                  <button
                    onClick={() => signOut()}
                    className="ml-2 px-3 py-2 rounded-lg bg-transparent text-silver-white hover:bg-primary-red/10"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-primary-red/20"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-primary-red" />
              ) : (
                <Menu className="w-6 h-6 text-silver-white" />
              )}
            </button>
          </div>

          {isOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="md:hidden pb-6 border-t border-primary-red/30"
            >
              <div className="flex flex-col gap-4 mt-4">
                <a href="#home" className="text-silver-white hover:text-primary-red">Home</a>
                <a href="#shop" className="text-silver-white hover:text-primary-red">Shop</a>
                <a href="#collections" className="text-silver-white hover:text-primary-red">Collections</a>
                {isAdmin && <a href="#admin" className="text-silver-white hover:text-primary-red">Admin</a>}
                <a href="#newsletter" className="text-silver-white hover:text-primary-red">Contact</a>
                {user ? (
                  <button onClick={() => signOut()} className="text-primary-red text-left">Logout</button>
                ) : (
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-matte-black/50 text-silver-white placeholder-silver-white/50 px-4 py-2 rounded border border-primary-red/30"
                  />
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>
      <LiveSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="h-20" />

      {authModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-matte-black border border-primary-red/30 rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary-red/20">
              <h3 className="text-lg font-bold text-silver-white">
                {user ? 'Account' : authMode === 'login' ? 'Login' : 'Sign up'}
              </h3>
              <button
                type="button"
                className="p-1 hover:bg-primary-red/20 rounded"
                onClick={() => setAuthModalOpen(false)}
              >
                <X className="w-5 h-5 text-silver-white" />
              </button>
            </div>

            <div className="p-4">
              {user ? (
                <>
                  <p className="text-silver-white/80 mb-3">
                    Signed in as <span className="font-semibold">{user.email}</span> ({user.role})
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      setAuthModalOpen(false);
                    }}
                    className="w-full bg-primary-red text-white rounded-lg px-4 py-2 font-semibold"
                  >
                    Logout
                  </button>
                  {!isAdmin && (
                    <p className="text-silver-white/60 text-sm mt-3">
                      You are not an admin account.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`flex-1 py-2 rounded-lg font-semibold ${
                        authMode === 'login' ? 'bg-primary-red text-black' : 'bg-black/40 text-silver-white border border-primary-red/20'
                      }`}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className={`flex-1 py-2 rounded-lg font-semibold ${
                        authMode === 'signup' ? 'bg-primary-red text-black' : 'bg-black/40 text-silver-white border border-primary-red/20'
                      }`}
                    >
                      Sign up
                    </button>
                  </div>

                  {authError && <p className="text-primary-red mb-3">{authError}</p>}

                  {authMode === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-3">
                      <input
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Email"
                        className="input"
                      />
                      <input
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        type="password"
                        placeholder="Password"
                        className="input"
                      />
                      <button
                        type="submit"
                        disabled={authSubmitting}
                        className="w-full bg-primary-red text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-60"
                      >
                        {authSubmitting ? 'Logging in...' : 'Login'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSignup} className="space-y-3">
                      <input
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Name"
                        className="input"
                      />
                      <input
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="Email"
                        className="input"
                      />
                      <input
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        type="password"
                        placeholder="Password"
                        className="input"
                      />
                      <p className="text-silver-white/60 text-sm">
                        New accounts are created as customers.
                      </p>
                      <button type="submit" className="w-full bg-primary-red text-white rounded-lg px-4 py-2 font-semibold">
                        Create account
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
      <WishlistModal isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  );
}
