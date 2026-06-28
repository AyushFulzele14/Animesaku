import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import {
  Navbar,
  Hero,
  Collections,
  FeaturedProducts,
  PromoBanner,
  Testimonials,
  Newsletter,
  Footer,
  TargetCursor,
  AdminProductManager,
  AdminCategoryManager,
  CartDrawer,
  AdminOrderDashboard,
  ProductDetailModal,
  ImageLightbox,
  FAQPage,
  AboutUsPage,
  PrivacyPolicyPage,
  TermsConditionsPage,
  RefundPolicyPage,
  ContactPage,
  NotFoundPage,
  Galaxy,
} from './components';

type ShopCategory = 'All' | 'Posters' | 'Stickers';

function AppContent() {
  const { isAdmin } = useAuth();
  const [shopCategory, setShopCategory] = useState<ShopCategory>('All');
  const [view, setView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Hash-based router listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#' || hash === '#home') {
        setView('home');
      } else if (hash === '#shop') {
        setView('shop');
      } else if (hash === '#collections') {
        setView('collections');
      } else if (hash === '#faq') {
        setView('faq');
      } else if (hash === '#about') {
        setView('about');
      } else if (hash === '#privacy') {
        setView('privacy');
      } else if (hash === '#terms') {
        setView('terms');
      } else if (hash === '#returns') {
        setView('returns');
      } else if (hash === '#contact' || hash === '#newsletter') {
        setView('contact');
      } else if (hash === '#admin') {
        setView('admin');
      } else if (hash === '#admin-orders') {
        setView('admin-orders');
      } else {
        setView('404');
      }
      window.scrollTo(0, 0);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen to open-product-details events
  useEffect(() => {
    const handleOpenDetails = (e: Event) => {
      const customEvent = e as CustomEvent<{ productId: string }>;
      setSelectedProductId(customEvent.detail.productId);
    };
    window.addEventListener('open-product-details', handleOpenDetails);
    return () => window.removeEventListener('open-product-details', handleOpenDetails);
  }, []);

  // Listen to open-image-lightbox events
  useEffect(() => {
    const handleOpenLightbox = (e: Event) => {
      const customEvent = e as CustomEvent<{ imageUrl: string }>;
      setLightboxImageUrl(customEvent.detail.imageUrl);
    };
    window.addEventListener('open-image-lightbox', handleOpenLightbox);
    return () => window.removeEventListener('open-image-lightbox', handleOpenLightbox);
  }, []);

  useEffect(() => {
    const onProductCreated = () => {
      setShopCategory('All');
      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener('product-created', onProductCreated);
    return () => window.removeEventListener('product-created', onProductCreated);
  }, []);

  const renderContent = () => {
    // Admin override when viewing home/admin route
    if (isAdmin && (view === 'home' || view === 'admin')) {
      return (
        <>
          <AdminCategoryManager />
          <AdminProductManager />
        </>
      );
    }

    switch (view) {
      case 'home':
        return (
          <>
            <Hero />
            <div className="max-w-7xl mx-auto px-4 py-8">
              <Collections onSelectCategory={(cat) => {
                setShopCategory(cat);
                window.location.hash = '#shop';
              }} />
            </div>
            <PromoBanner />
            <Testimonials />
            <Newsletter />
          </>
        );
      case 'shop':
        return (
          <div id="shop" className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 border-b border-primary-red/10 bg-matte-black/40 rounded-3xl"
            >
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-red via-light-pink to-white mb-3">
                THE SHOP
              </h1>
              <p className="text-silver-white/60 text-sm md:text-base max-w-xl mx-auto">
                Handcrafted premium prints, posters, and waterproof vinyl stickers.
              </p>
            </motion.div>
            <FeaturedProducts forcedCategory={shopCategory} />
          </div>
        );
      case 'collections':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 border-b border-primary-red/10 bg-matte-black/40 rounded-3xl"
            >
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-red via-light-pink to-white mb-3">
                ART COLLECTIONS
              </h1>
              <p className="text-silver-white/60 text-sm md:text-base max-w-xl mx-auto">
                Curated collections by style, series, and finish types.
              </p>
            </motion.div>
            <Collections onSelectCategory={(cat) => {
              setShopCategory(cat);
              window.location.hash = '#shop';
            }} />
          </div>
        );
      case 'admin-orders':
        if (isAdmin) {
          return <AdminOrderDashboard />;
        }
        return <NotFoundPage />;
      case 'faq':
        return <FAQPage />;
      case 'about':
        return <AboutUsPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsConditionsPage />;
      case 'returns':
        return <RefundPolicyPage />;
      case 'contact':
        return <ContactPage />;
      case '404':
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="bg-black text-silver-white font-montserrat overflow-x-hidden flex flex-col min-h-screen">
      <TargetCursor 
        targetSelector="a, button, [role='button'], .cursor-target"
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
        cursorColor="#ee1010"
        cursorColorOnTarget="#ffffff"
      />
      
      {/* Dynamic WebGL Galaxy Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
        <Galaxy
          starSpeed={0.5}
          density={1}
          hueShift={140}
          speed={1}
          glowIntensity={0.3}
          saturation={0}
          mouseRepulsion={true}
          repulsionStrength={2}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          transparent={true}
        />
      </div>

      <Navbar />
      <CartDrawer />
      
      <main className="flex-grow pt-4">
        {renderContent()}
      </main>
      
      <Footer />

      <ProductDetailModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />
      <ImageLightbox
        imageUrl={lightboxImageUrl}
        onClose={() => setLightboxImageUrl(null)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
