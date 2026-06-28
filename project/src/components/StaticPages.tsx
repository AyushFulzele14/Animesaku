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
    <div className="max-w-4xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-red to-light-pink mb-4">
          Contact Support
        </h1>
        <p className="text-silver-white/60">Have any custom order inquiries or order support requests? Send us a message.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-matte-black/60 border border-primary-red/20 rounded-3xl p-6 lg:p-8">
        {/* Contact info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-silver-white">Get in Touch</h2>
          <p className="text-silver-white/70 leading-relaxed text-sm">
            Feel free to contact us about bulk orders, custom printing sizes, collaborations, or tracking inquiries.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-silver-white/80">
              <Mail className="w-5 h-5 text-primary-red" />
              <div>
                <p className="text-xs text-silver-white/40">Email Us</p>
                <a href="mailto:support@animysaku.store" className="text-sm font-semibold hover:underline">
                  support@animysaku.store
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-silver-white/80">
              <div className="w-5 h-5 border border-primary-red rounded-full flex items-center justify-center text-[10px] text-primary-red font-bold">
                IG
              </div>
              <div>
                <p className="text-xs text-silver-white/40">Instagram DM</p>
                <a
                  href="https://www.instagram.com/animysaku.store?igsh=MTRpaHA0Mnk4dmY4cQ=="
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold hover:underline"
                >
                  @animysaku.store
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input focus:border-primary-red transition-all"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input focus:border-primary-red transition-all"
          />
          <input
            type="text"
            required
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input focus:border-primary-red transition-all"
          />
          <textarea
            required
            rows={4}
            placeholder="Message details..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input focus:border-primary-red transition-all resize-none"
          />

          {status && (
            <div className="text-xs text-silver-white bg-green-500/10 border border-green-500/30 p-3 rounded-xl">
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-primary-red text-black font-bold py-3 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send Message'}
          </button>
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
