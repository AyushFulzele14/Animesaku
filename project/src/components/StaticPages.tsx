import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Mail, Send, AlertTriangle } from 'lucide-react';

/* ==========================================================================
   FAQ Section
   ========================================================================== */
export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What is the quality of the prints?',
      a: 'All our posters are printed on ultra-premium 300 GSM matte cardstock paper using high-resolution archival inks. This ensures crisp graphics, deep blacks, and rich colors that do not fade over time.',
    },
    {
      q: 'Are the stickers waterproof?',
      a: 'Yes! Our stickers are printed on premium vinyl with a waterproof matte finish. They are dishwasher-safe, weather-resistant, and perfect for laptops, water bottles, skateboards, and cars.',
    },
    {
      q: 'How long does shipping take?',
      a: 'We process all orders within 24-48 hours. Shipping takes 3-5 business days for domestic orders, and 7-14 business days for international shipments. You will receive a tracking link via email once shipped.',
    },
    {
      q: 'Do you accept cash on delivery?',
      a: 'Yes, we offer Cash on Delivery (COD) for selected pin codes, alongside secure pre-paid options using credit cards, UPI, and wallets via Razorpay.',
    },
    {
      q: 'What is your return policy?',
      a: 'We offer a 7-day return policy for damaged or defective merchandise. Simply email us at support@animysaku.store with photos of the damaged items, and we will ship a replacement or issue a refund immediately.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-red to-light-pink mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-silver-white/60">Got questions? We have answers. Find everything about prints, delivery, and refunds.</p>
      </motion.div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border border-primary-red/20 rounded-2xl bg-matte-black/60 overflow-hidden transition-all duration-300 hover:border-primary-red/50"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left font-bold text-silver-white hover:text-primary-red transition-colors duration-200"
            >
              <span>{faq.q}</span>
              {openIndex === i ? (
                <ChevronUp className="w-5 h-5 text-primary-red" />
              ) : (
                <ChevronDown className="w-5 h-5 text-silver-white" />
              )}
            </button>
            {openIndex === i && (
              <div className="p-5 border-t border-primary-red/10 bg-black/40 text-silver-white/80 leading-relaxed text-sm">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   About Us Section
   ========================================================================== */
export function AboutUsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-red to-light-pink mb-4">
          About AnimySaku Store
        </h1>
        <p className="text-silver-white/60 text-lg">Blending Japanese cyberpunk aesthetics with state-of-the-art print craftsmanship.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-matte-black/60 border border-primary-red/20 rounded-3xl p-6 lg:p-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-silver-white">Our Vision</h2>
          <p className="text-silver-white/70 leading-relaxed text-sm">
            At AnimySaku, we design and produce premium anime merchandise for enthusiasts who value art and visual aesthetics. We curate striking graphic prints inspired by neo-Tokyo streets, classic cyberpunk themes, and legendary anime moments.
          </p>
          <p className="text-silver-white/70 leading-relaxed text-sm">
            Our items aren't just posters or stickers; they are premium collector's art. Every piece is handcrafted by our in-house designers and printed on materials that meet global museum-grade quality standards.
          </p>
        </div>
        <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-primary-red/20 bg-black relative">
          <img
            src="https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Anime Workspace Studio"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Privacy Policy
   ========================================================================== */
export function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 text-sm text-silver-white/80 leading-relaxed">
      <h1 className="text-3xl font-extrabold text-silver-white mb-6 text-center">Privacy Policy</h1>
      <p>Last updated: June 14, 2026</p>
      
      <p>
        AnimySaku Store ("us", "we", or "our") operates the website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
      </p>

      <h2 className="text-xl font-bold text-silver-white mt-8">1. Information Collection and Use</h2>
      <p>
        We collect several different types of information for various purposes to provide and improve our e-commerce services to you. Information collected includes your email, name, phone number, shipping address, and order transactions.
      </p>

      <h2 className="text-xl font-bold text-silver-white mt-8">2. Payment Security</h2>
      <p>
        All prepaid transactions are processed through secure, encrypted gateways (Razorpay). We do not store or collect your payment card details on our servers. That information is provided directly to our third-party payment processors.
      </p>

      <h2 className="text-xl font-bold text-silver-white mt-8">3. Cookies</h2>
      <p>
        We use cookies and similar tracking technologies to track the activity on our store and keep hold of shopping cart items. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
      </p>
    </div>
  );
}

/* ==========================================================================
   Terms and Conditions
   ========================================================================== */
export function TermsConditionsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 text-sm text-silver-white/80 leading-relaxed">
      <h1 className="text-3xl font-extrabold text-silver-white mb-6 text-center">Terms & Conditions</h1>
      <p>Last updated: June 14, 2026</p>

      <p>
        Welcome to AnimySaku Store. Please read these Terms and Conditions carefully before using our website. By accessing or ordering from our site, you agree to be bound by these terms.
      </p>

      <h2 className="text-xl font-bold text-silver-white mt-8">1. Copyright and Intellectual Property</h2>
      <p>
        All artwork, custom designs, logos, layouts, and photographic assets displayed on this website are protected under international copyright laws and belong exclusively to AnimySaku Store. Copying or redistribution is strictly prohibited.
      </p>

      <h2 className="text-xl font-bold text-silver-white mt-8">2. Pricing and Billing</h2>
      <p>
        We reserve the right to modify prices, discount codes, or stock availability at any time without notice. All prices include applicable taxes. Delivery fees, if any, will be shown at checkout.
      </p>

      <h2 className="text-xl font-bold text-silver-white mt-8">3. Limitation of Liability</h2>
      <p>
        We are not responsible for any indirect, incidental, or consequential damages resulting from product usage or shipment delays caused by shipping providers.
      </p>
    </div>
  );
}

/* ==========================================================================
   Refund and Return Policy
   ========================================================================== */
export function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 text-sm text-silver-white/80 leading-relaxed">
      <h1 className="text-3xl font-extrabold text-silver-white mb-6 text-center">Refund & Return Policy</h1>
      <p>Last updated: June 14, 2026</p>

      <p>
        We stand behind our prints and want you to be fully satisfied with your anime merchandise.
      </p>

      <h2 className="text-xl font-bold text-silver-white mt-8">1. Damaged or Misprinted Items</h2>
      <p>
        If your order arrives damaged, crushed during transport, or misprinted, please contact us within 7 days of delivery at support@animysaku.store with photos of the package and item. We will dispatch a brand-new replacement at no extra charge or issue a 100% refund.
      </p>

      <h2 className="text-xl font-bold text-silver-white mt-8">2. Returns & Exchanges</h2>
      <p>
        Because all our posters are custom-printed upon ordering, we do not accept returns for change of mind or accidental orders. Please check specifications (sizes, finishes) carefully before checkout.
      </p>

      <h2 className="text-xl font-bold text-silver-white mt-8">3. Refund Processing</h2>
      <p>
        Once a refund is approved, it will be processed and credited back to your original payment method within 5-7 business days.
      </p>
    </div>
  );
}

/* ==========================================================================
   Contact Us Page
   ========================================================================== */
export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    // Simulate contact ticket submission
    setTimeout(() => {
      setSending(false);
      setStatus('Message sent successfully! Our team will contact you in 24 hours.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 relative">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary-red/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-light-pink/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="text-xs font-bold tracking-widest text-primary-red uppercase bg-primary-red/10 border border-primary-red/20 px-3 py-1.5 rounded-full inline-block mb-4">
          Support Grid
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-red via-light-pink to-white tracking-tight mb-4">
          CONTACT SUPPORT
        </h1>
        <p className="text-silver-white/60 max-w-xl mx-auto text-sm md:text-base">
          Have bulk order inquiries, collaboration requests, or questions about your shipment? Send us a ticket.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-matte-black/40 border border-primary-red/10 backdrop-blur-md rounded-[32px] p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Contact Info (2/5 columns) */}
        <div className="lg:col-span-2 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-silver-white tracking-tight">Get in Touch</h2>
            <p className="text-silver-white/70 leading-relaxed text-sm">
              We design and print everything locally. Drop us a line, and our support agents will respond to your transmission within 24 hours.
            </p>
          </div>

          <div className="space-y-4 my-6 lg:my-0">
            {/* Mail Card */}
            <motion.a 
              href="mailto:support@animysaku.store"
              whileHover={{ x: 6, borderColor: 'rgba(238, 16, 16, 0.4)' }}
              className="flex items-center gap-4 bg-black/60 border border-primary-red/10 rounded-2xl p-4 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary-red/10 border border-primary-red/20 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-red" />
              </div>
              <div>
                <p className="text-xs text-silver-white/40 font-semibold uppercase tracking-wider">Email Support</p>
                <p className="text-sm font-bold text-silver-white hover:text-primary-red transition-colors">
                  support@animysaku.store
                </p>
              </div>
            </motion.a>
            
            {/* Instagram Card */}
            <motion.a 
              href="https://www.instagram.com/animysaku.store?igsh=MTRpaHA0Mnk4dmY4cQ=="
              target="_blank"
              rel="noreferrer"
              whileHover={{ x: 6, borderColor: 'rgba(238, 16, 16, 0.4)' }}
              className="flex items-center gap-4 bg-black/60 border border-primary-red/10 rounded-2xl p-4 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary-red/10 border border-primary-red/20 rounded-xl flex items-center justify-center text-sm text-primary-red font-black">
                IG
              </div>
              <div>
                <p className="text-xs text-silver-white/40 font-semibold uppercase tracking-wider">Instagram Channel</p>
                <p className="text-sm font-bold text-silver-white hover:text-primary-red transition-colors">
                  @animysaku.store
                </p>
              </div>
            </motion.a>

            {/* WhatsApp Card */}
            <motion.a 
              href="https://wa.me/919359320860"
              target="_blank"
              rel="noreferrer"
              whileHover={{ x: 6, borderColor: 'rgba(34, 197, 94, 0.4)' }}
              className="flex items-center gap-4 bg-black/60 border border-primary-red/10 rounded-2xl p-4 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary-red/10 border border-primary-red/20 rounded-xl flex items-center justify-center text-primary-red">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.208-3.816l.41.243c1.558.924 3.42 1.412 5.334 1.413 5.485 0 9.948-4.463 9.952-9.953.002-2.66-1.033-5.161-2.913-7.043C17.168 3.02 14.67 1.986 12.01 1.986c-5.49 0-9.955 4.463-9.96 9.953-.002 1.83.479 3.619 1.393 5.198l.255.441L2.704 21.03l3.561-1.306zm13.149-10.222c-.3-.15-1.77-.874-2.046-.975-.276-.102-.477-.152-.676.15-.199.3-.772.976-.947 1.176-.174.201-.35.226-.65.076-.3-.15-1.267-.467-2.414-1.49-1.066-.951-1.802-2.124-2.011-2.424-.21-.3-.022-.462.128-.611.135-.135.3-.349.45-.524.15-.175.2-.299.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.629-.926-2.229-.244-.587-.492-.507-.676-.516-.175-.008-.375-.01-.576-.01-.2 0-.526.075-.801.375-.276.3-1.053 1.026-1.053 2.502 0 1.477 1.077 2.9 1.226 3.1.15.2 2.119 3.235 5.132 4.536.716.31 1.275.495 1.71.634.72.228 1.375.196 1.893.118.577-.087 1.77-.724 2.02-1.388.251-.664.251-1.233.175-1.353-.075-.12-.275-.195-.575-.345z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-silver-white/40 font-semibold uppercase tracking-wider">WhatsApp Support</p>
                <p className="text-sm font-bold text-silver-white hover:text-green-500 transition-colors">
                  +91 93593 20860
                </p>
              </div>
            </motion.a>
          </div>

          <div className="text-xs text-silver-white/30 font-semibold tracking-wider uppercase">
            © AnimySaku Store Corp.
          </div>
        </div>

        {/* Contact Form (3/5 columns) */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-silver-white/60">Your Name</label>
              <input
                type="text"
                required
                placeholder="Otaku"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/65 border border-primary-red/20 rounded-xl px-4 py-3 text-sm text-silver-white placeholder-silver-white/20 focus:outline-none focus:border-primary-red transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-silver-white/60">Email Address</label>
              <input
                type="email"
                required
                placeholder="otaku@grid.net"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/65 border border-primary-red/20 rounded-xl px-4 py-3 text-sm text-silver-white placeholder-silver-white/20 focus:outline-none focus:border-primary-red transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-silver-white/60">Message Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Custom Size Request"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-black/65 border border-primary-red/20 rounded-xl px-4 py-3 text-sm text-silver-white placeholder-silver-white/20 focus:outline-none focus:border-primary-red transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-silver-white/60">Transmission Details</label>
            <textarea
              required
              rows={4}
              placeholder="Type details of your request here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-black/65 border border-primary-red/20 rounded-xl px-4 py-3 text-sm text-silver-white placeholder-silver-white/20 focus:outline-none focus:border-primary-red transition-all resize-none"
            />
          </div>

          {status && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-silver-white bg-green-500/10 border border-green-500/30 p-4 rounded-xl font-medium"
            >
              {status}
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-primary-red text-black font-extrabold py-3.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(238,16,16,0.2)] hover:shadow-[0_0_20px_rgba(238,16,16,0.35)]"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Transmitting...' : 'Send Transmission'}
          </motion.button>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
   404 - Not Found Section
   ========================================================================== */
export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <motion.div
        animate={{ rotate: [0, -5, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
        className="inline-block"
      >
        <AlertTriangle className="w-20 h-20 text-primary-red mx-auto" />
      </motion.div>
      <h1 className="text-5xl font-black text-silver-white tracking-tight">404 ERROR</h1>
      <p className="text-lg text-primary-red font-bold uppercase tracking-widest text-shadow-glow">
        Address Not Found
      </p>
      <p className="text-silver-white/60 text-sm">
        The link you followed is broken, or the grid address has been purged. Go back home to restore your connection.
      </p>
      <a
        href="#"
        className="inline-block bg-primary-red text-black font-bold px-6 py-3 rounded-xl hover:bg-red-600 shadow-neon-red transition-all duration-200"
      >
        Back to Home
      </a>
    </div>
  );
}
