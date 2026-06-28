import { FormEvent, useEffect, useState, useRef } from 'react';
import { ShoppingCart, Heart, User, Menu, X, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { LiveSearch } from './LiveSearch';
import { ThemeToggle } from './ThemeToggle';
import { MusicToggle } from './MusicToggle';
import { OrderHistory } from './OrderHistory';
import { WishlistModal } from './WishlistModal';
import { useAuth, useCart } from '../hooks';
import { gsap } from 'gsap';
import './Navbar.css';

export function Navbar() {
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

  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<gsap.core.Timeline[]>([]);
  const activeTweenRefs = useRef<any[]>([]);

  const [activeHash, setActiveHash] = useState(window.location.hash || '#home');

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Shop', href: '#shop' },
    { label: 'Collections', href: '#collections' },
    ...(isAdmin ? [
      { label: 'Products', href: '#admin' },
      { label: 'Orders', href: '#admin-orders' }
    ] : []),
    { label: 'Contact', href: '#contact' }
  ];

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash || '#home');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease: 'power3.easeOut', overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease: 'power3.easeOut', overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease: 'power3.easeOut', overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    const timer = setTimeout(layout, 150);

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, [navItems]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease: 'power3.easeOut',
      overwrite: 'auto'
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease: 'power3.easeOut',
      overwrite: 'auto'
    });
  };

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'customer' | 'admin'>('customer');

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
    setSignupRole('customer');
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
    await signUp(signupName, signupEmail, signupPassword, signupRole);
  };

  return (
    <>
      {showOrderHistory && <OrderHistory onClose={() => setShowOrderHistory(false)} />}
      <motion.nav
        initial={{ y: -120, x: '-50%' }}
        animate={{ y: 0, x: '-50%' }}
        transition={{ duration: 0.5 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl z-50 backdrop-blur-md bg-black/60 border border-primary-red/25 rounded-[32px] px-6 py-2.5 shadow-[0_8px_32px_rgba(238,16,16,0.15)]"
      >
        <div className="w-full flex justify-between items-center h-14">
          <a href="#home" className="flex items-center hover:opacity-80 transition-opacity duration-300">
            <Logo size="medium" showGlow={false} />
          </a>

          {/* PillNav items (Desktop) */}
          <div className="hidden md:block">
            <ul className="pill-list">
              {navItems.map((item, i) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`pill${activeHash === item.href ? ' is-active' : ''}`}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle"
                      ref={(el) => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover">{item.label}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full hover:bg-primary-red/10 transition-colors duration-300"
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
              className="relative p-2 rounded-full hover:bg-primary-red/10 transition-colors duration-300"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 text-silver-white" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-red text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              className="relative p-2 rounded-full hover:bg-primary-red/10 transition-colors duration-300"
              onClick={toggleCart}
            >
              <ShoppingCart className="w-5 h-5 text-silver-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-red text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-full hover:bg-primary-red/10 transition-colors duration-300"
              onClick={() => (user ? setAuthModalOpen(true) : openAuthModal('login'))}
            >
              <User className="w-5 h-5 text-silver-white" />
            </motion.button>

            {user && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowOrderHistory(true)}
                  className="p-2 rounded-full hover:bg-primary-red/10 transition-colors duration-300"
                  title="Order History"
                >
                  <Package className="w-5 h-5 text-silver-white" />
                </motion.button>
                <button
                  onClick={() => signOut()}
                  className="ml-1 px-3 py-1.5 rounded-full bg-primary-red text-black font-extrabold text-xs tracking-wider hover:opacity-95 transition-opacity"
                >
                  LOGOUT
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-full hover:bg-primary-red/10 transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-primary-red" />
            ) : (
              <Menu className="w-6 h-6 text-silver-white" />
            )}
          </button>
        </div>

        {/* Mobile menu expanded container */}
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden mt-3 pt-3 border-t border-primary-red/10 flex flex-col gap-3"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-colors ${
                  activeHash === item.href
                    ? 'bg-primary-red/10 text-primary-red'
                    : 'text-silver-white hover:text-primary-red'
                }`}
              >
                {item.label}
              </a>
            ))}

            <div className="flex items-center justify-around border-t border-primary-red/10 pt-3 mt-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => { setSearchOpen(true); setIsOpen(false); }}
                className="p-2 rounded-full hover:bg-primary-red/10"
              >
                <svg className="w-5 h-5 text-silver-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.button>
              <MusicToggle />
              <ThemeToggle />
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => { setWishlistOpen(true); setIsOpen(false); }}
                className="relative p-2 rounded-full hover:bg-primary-red/10"
              >
                <Heart className="w-5 h-5 text-silver-white" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-red text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => { toggleCart(); setIsOpen(false); }}
                className="relative p-2 rounded-full hover:bg-primary-red/10"
              >
                <ShoppingCart className="w-5 h-5 text-silver-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-red text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => {
                  setIsOpen(false);
                  user ? setAuthModalOpen(true) : openAuthModal('login');
                }}
                className="p-2 rounded-full hover:bg-primary-red/10"
              >
                <User className="w-5 h-5 text-silver-white" />
              </motion.button>
              {user && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => { setShowOrderHistory(true); setIsOpen(false); }}
                    className="p-2 rounded-full hover:bg-primary-red/10"
                  >
                    <Package className="w-5 h-5 text-silver-white" />
                  </motion.button>
                  <button
                    onClick={() => { signOut(); setIsOpen(false); }}
                    className="text-primary-red text-xs font-black tracking-wider"
                  >
                    LOGOUT
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>
      <LiveSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="h-28" />

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
                <div className="space-y-5 text-left">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 bg-black/45 border border-primary-red/10 rounded-2xl p-4">
                    <div className="w-14 h-14 bg-primary-red/10 border border-primary-red/25 rounded-full flex items-center justify-center text-primary-red font-black text-2xl uppercase shadow-inner">
                      {user.name ? user.name[0] : user.email[0]}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-silver-white uppercase tracking-wider">
                        {user.name || 'Store Member'}
                      </h4>
                      <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block border mt-1.5 ${
                        user.role === 'admin' 
                          ? 'bg-primary-red/10 border-primary-red/35 text-primary-red shadow-[0_0_10px_rgba(238,16,16,0.15)]'
                          : 'bg-silver-white/5 border-silver-white/20 text-silver-white/70'
                      }`}>
                        {user.role === 'admin' ? 'Store Admin' : 'Customer Account'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Fields */}
                  <div className="space-y-2.5 bg-black/25 border border-white/5 rounded-2xl p-4 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-silver-white/40 uppercase tracking-wider font-semibold">Email Address</span>
                      <span className="font-bold text-silver-white">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-silver-white/40 uppercase tracking-wider font-semibold">Account ID</span>
                      <span className="font-mono text-silver-white/60 select-all">{user.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-silver-white/40 uppercase tracking-wider font-semibold">Access Level</span>
                      <span className="font-extrabold text-primary-red uppercase tracking-wider">
                        {user.role === 'admin' ? 'Full Authority' : 'Standard Member'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      setAuthModalOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-primary-red text-black font-extrabold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(238,16,16,0.2)]"
                  >
                    Logout Session
                  </button>
                </div>
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
                      <div className="flex flex-col gap-2 my-3">
                        <label className="text-xs uppercase tracking-wider text-silver-white/60 font-semibold">Account Role</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSignupRole('customer')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${
                              signupRole === 'customer'
                                ? 'bg-primary-red text-black border-primary-red'
                                : 'bg-black/40 border-primary-red/20 text-silver-white/60 hover:border-primary-red/55'
                            }`}
                          >
                            Customer
                          </button>
                          <button
                            type="button"
                            onClick={() => setSignupRole('admin')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${
                              signupRole === 'admin'
                                ? 'bg-primary-red text-black border-primary-red'
                                : 'bg-black/40 border-primary-red/20 text-silver-white/60 hover:border-primary-red/55'
                            }`}
                          >
                            Admin
                          </button>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-primary-red text-black rounded-lg px-4 py-2 font-semibold hover:opacity-95 transition-opacity">
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
