# ANIMYSAKU STORE - Project Documentation

## Overview

ANIMYSAKU STORE is a premium anime ecommerce frontend built with React, TypeScript, Tailwind CSS, and Framer Motion. It features a dark Japanese cyberpunk aesthetic with neon glow effects and smooth animations.

## Project Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion 11
- **Build**: Vite 5
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Client**: @supabase/supabase-js 2

## Key Features

### Visual Design
- Dark matte black background with neon red accents
- Sakura particle animations throughout the site
- Glowing effects on buttons, cards, and text
- Japanese cyberpunk aesthetic inspired by the brand board
- Premium glassmorphism UI elements
- Smooth hover and scroll animations

### Components
1. **Navbar** - Fixed header with search, cart, wishlist, and user profile
2. **Hero Section** - Fullscreen animated entry with logo and CTAs
3. **Collections** - Grid of product categories with hover effects
4. **Featured Products** - Product grid with ratings, prices, and quick actions
5. **Promo Banner** - Large promotional section with animations
6. **Testimonials** - Customer reviews with ratings and avatars
7. **Newsletter** - Email subscription form with validation
8. **Footer** - Links, social media, and copyright info
9. **SakuraParticles** - Animated background particles

### Custom Hooks
- `useCart` - Cart state management (add, remove, update quantity)
- `useProducts` - Product data fetching and state management

### Database (Supabase)
- **products** (12 seeded items)
- **cart_items** (user-specific)
- **orders** (user-specific)
- **order_items** (related to orders)

All tables have Row Level Security (RLS) enabled for security.

## Color System

```
Primary Red:    #ee1010
Dark Red:       #DD0E2E
Soft Pink:      #991C12
Light Pink:     #FFB1D2
Matte Black:    #1a1a18
Silver White:   #c9c9c9
```

## File Structure

```
src/
├── components/           # Reusable UI components
├── config/              # Theme and configuration
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries (Supabase client)
├── types/               # TypeScript interfaces
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles

tailwind.config.js       # Tailwind configuration with custom colors
index.html               # HTML template with fonts
```

## Development Guidelines

### Adding New Components
1. Create component in `src/components/` directory
2. Use TypeScript for type safety
3. Export from `src/components/index.ts`
4. Use Framer Motion for animations
5. Follow the naming pattern: PascalCase

### Styling
- Use Tailwind CSS utility classes
- Apply custom colors from config (primary-red, dark-red, etc.)
- Use neon-red and glow shadow classes for glow effects
- Maintain consistent spacing using 4px/8px units

### Animations
- Use Framer Motion for all animations
- Apply consistent timing (0.3s for hovers, 0.6s for page sections)
- Use easing: 'easeOut' for entry, 'easeInOut' for continuous

### Database Operations
- Always check auth.uid() in RLS policies
- Use maybeSingle() instead of single() for optional results
- Implement proper error handling in data fetches

## Environment Setup

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Key Design Decisions

1. **Glassmorphism**: Semi-transparent backgrounds with blur create depth and luxury feel
2. **Neon Effects**: Red glow shadows create cyberpunk aesthetic from brand board
3. **Sakura Particles**: Floating pink particles add movement and anime atmosphere
4. **Dark Background**: Matte black provides contrast for glowing elements
5. **Smooth Transitions**: All hover and scroll effects use Framer Motion for polish

## Performance Considerations

- Images use Pexels stock photos (external CDN)
- Lucide React icons are optimized and tree-shaken
- Framer Motion animations are GPU-accelerated
- Tailwind CSS is purged for production
- Build size warning indicates potential for code splitting

## Future Enhancements

1. Add shopping cart modal
2. Implement user authentication flows
3. Create product detail pages
4. Add filters and search functionality
5. Implement checkout process
6. Add admin dashboard for product management
7. Setup payment processing with Stripe
8. Add social sharing features
9. Implement wishlist functionality
10. Add product reviews/comments

## Testing

Run type checking:
```bash
npm run typecheck
```

Run linting:
```bash
npm run lint
```

## Production Deployment

Build for production:
```bash
npm run build
```

The `dist/` folder contains optimized production-ready files.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes for Future Development

- The neon glow effects are defined in tailwind.config.js as custom shadows
- Custom animations (glow, float, pulse) are in tailwind.config.js
- Component animations are handled individually with Framer Motion
- All colors reference the theme config for easy brand consistency
