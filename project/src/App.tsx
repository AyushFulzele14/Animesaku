import { useEffect, useState } from 'react';
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
  SakuraParticles,
  AnimeCursor,
  AIRecommendations,
  AdminProductManager,
  AdminCategoryManager,
  CartDrawer,
  AdminOrderDashboard,
  ProductDetailModal,
  FAQPage,
  AboutUsPage,
  PrivacyPolicyPage,
  TermsConditionsPage,
  RefundPolicyPage,
  ContactPage,
  NotFoundPage,
} from './components';

type ShopCategory = 'All' | 'Posters' | 'Stickers';

function AppContent() {
  const { isAdmin } = useAuth();
  const [shopCategory, setShopCategory] = useState<ShopCategory>('All');
  const [showAdminOrders, setShowAdminOrders] = useState(false);
  const [view, setView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Hash-based router listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#' || hash === '#home') {
        setView('home');
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
      } else {
        // Scroll navigation helpers for sections
        if (hash.startsWith('#shop') || hash.startsWith('#collections')) {
          setView('home');
          setTimeout(() => {
            document.getElementById(hash.substring(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } else {
          setView('404');
        }
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
      if (showAdminOrders) return <AdminOrderDashboard />;
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
            <Collections onSelectCategory={setShopCategory} />
            <FeaturedProducts forcedCategory={shopCategory} />
            <AIRecommendations />
            <PromoBanner />
            <Testimonials />
            <Newsletter />
          </>
        );
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
      <AnimeCursor />
      <SakuraParticles />

      <Navbar onAdminOrdersClick={() => setShowAdminOrders(!showAdminOrders)} />
      <CartDrawer />
      
      <main className="flex-grow pt-4">
        {renderContent()}
      </main>
      
      <Footer />

      <ProductDetailModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
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
