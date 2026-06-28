# ANIMYSAKU STORE - Premium Anime Ecommerce Frontend

A stunning, fully responsive anime ecommerce website built with React, TypeScript, Tailwind CSS, and Framer Motion. Features a dark Japanese cyberpunk aesthetic with neon effects, smooth animations, and premium UI design.

## Features

- **Premium Design**: Dark Japanese cyberpunk anime aesthetic with neon red glow effects
- **Fully Responsive**: Mobile-first design that works seamlessly on all devices
- **Smooth Animations**: Sakura particles, neon glow effects, and scroll animations using Framer Motion
- **Modern Components**: Reusable React components with TypeScript support
- **Product Showcase**: Grid layout with hover effects and detailed product cards
- **Shopping Features**: Cart management, wishlist, and product filtering
- **Newsletter Signup**: Email subscription with validation
- **Testimonials**: Customer reviews with ratings
- **Social Integration**: Footer with social media links
- **Admin-Ready**: Easy theme customization and product management

## Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Client**: @supabase/supabase-js

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Collections.tsx
│   ├── ProductCard.tsx
│   ├── FeaturedProducts.tsx
│   ├── PromoBanner.tsx
│   ├── Testimonials.tsx
│   ├── Newsletter.tsx
│   ├── Footer.tsx
│   ├── SakuraParticles.tsx
│   └── index.ts
├── config/              # Configuration files
│   └── theme.ts
├── hooks/               # Custom React hooks
│   ├── useCart.ts
│   ├── useProducts.ts
│   └── index.ts
├── lib/                 # Utility functions
│   └── supabase.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── App.tsx              # Main application component
├── main.tsx             # Entry point
└── index.css            # Global styles

```

## Color Palette

- **Primary Red**: #ee1010
- **Dark Red**: #DD0E2E
- **Soft Pink**: #991C12
- **Light Pink**: #FFB1D2
- **Matte Black**: #1a1a18
- **Silver White**: #c9c9c9

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd animysaku-store
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Type Checking

Run TypeScript type checking:
```bash
npm run typecheck
```

### Linting

Run ESLint:
```bash
npm run lint
```

## Database Schema

### Tables

- **products**: Store product information with pricing, ratings, and images
- **cart_items**: User shopping cart items
- **orders**: Customer orders
- **order_items**: Individual items within orders

All tables include Row Level Security (RLS) policies for user data protection.

## Components

### Navbar
- Transparent glass effect with neon borders
- Search functionality
- Cart and wishlist indicators
- Mobile responsive hamburger menu

### Hero Section
- Fullscreen animated hero
- Glowing logo and text effects
- Call-to-action buttons
- Sakura particle animations

### Collections
- Category showcase grid
- Icon representations
- Hover animations with glow effects

### Product Grid
- Responsive grid layout
- Hover animations with quick actions
- Star ratings and reviews
- Sale badges and pricing

### Promotional Banner
- Large featured promotions
- Gradient effects and animations
- Call-to-action buttons

### Testimonials
- Customer reviews with ratings
- Avatar images
- Hover effects and animations

### Newsletter
- Email subscription form
- Success feedback
- Animated icons

### Footer
- Quick links and navigation
- Social media integration
- Copyright information

## Customization

### Theme Colors

Edit `src/config/theme.ts` to customize colors, or modify Tailwind config in `tailwind.config.js`.

### Products

Products can be managed through:
1. Supabase dashboard
2. Custom admin panel (to be added)
3. JSON configuration

### Animations

All animations are handled by Framer Motion. Modify component animation properties in individual component files.

## Performance Optimizations

- Lazy loading for images
- Code splitting recommendations
- Optimized CSS with Tailwind
- Efficient component rendering
- Smooth scroll behavior

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please create an issue in the repository or contact support.

---

Made with love for anime enthusiasts and gaming lovers.
