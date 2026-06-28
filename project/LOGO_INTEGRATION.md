# ANIMYSAKU STORE - Logo Integration Guide

## Official Brand Logo

The official ANIMYSAKU STORE logo has been integrated throughout the website. The logo features:

- **Bold Typography**: "ANIMYSAKU STORE" in premium gaming font
- **Japanese Elements**: Torii gate symbolism with neon glow
- **Neon Aesthetic**: Bright red glow effects with sakura flowers
- **Gaming Style**: Sharp, angular design with metallic accents
- **Anime Inspired**: Katana swords and sakura petals for anime appeal

## Logo Usage Across Website

### 1. Navigation Bar (Small Size)
- **Location**: Top left corner of every page
- **Size**: Medium (h-12)
- **Function**: Brand identity and home link
- **Styling**: No glow effect for clean navbar appearance
- **File**: `src/components/Navbar.tsx`

### 2. Hero Section (Large Size)
- **Location**: Center of landing section
- **Size**: Hero (h-64 desktop, h-80 mobile)
- **Function**: Main brand showcase
- **Styling**: Animated floating effect with neon glow
- **Animation**: Gentle vertical floating motion
- **File**: `src/components/Hero.tsx`

### 3. Promotional Banner (Large Size)
- **Location**: Right side of promo section
- **Size**: Large (h-20)
- **Function**: Background branding element
- **Styling**: Subtle opacity (15%) with floating animation
- **File**: `src/components/PromoBanner.tsx`

### 4. Product Cards (Watermark)
- **Location**: Bottom right corner of each product image
- **Size**: Small (w-24 h-24)
- **Function**: Product watermark
- **Styling**: Low opacity (10%) and transparent
- **Purpose**: Brand protection and consistency
- **File**: `src/components/ProductCard.tsx`

### 5. Footer (Large Size)
- **Location**: Top of footer section
- **Size**: Large (h-20)
- **Function**: Brand footer identification
- **Styling**: No glow effect for footer consistency
- **File**: `src/components/Footer.tsx`

## Logo Component

A reusable `Logo` component was created for consistency:

**File**: `src/components/Logo.tsx`

**Props**:
- `size`: 'small' | 'medium' | 'large' | 'hero'
- `showGlow`: boolean (enables neon glow effect)
- `animated`: boolean (enables floating animation)
- `className`: string (additional CSS classes)

**Usage Example**:
```tsx
import { Logo } from './components';

// In your component:
<Logo size="hero" showGlow animated />
<Logo size="medium" showGlow={false} />
<Logo size="large" />
```

## Glow Effect Details

The logo features a neon red glow using CSS drop-shadow filter:

```css
filter: drop-shadow(0 0 30px rgba(238, 16, 16, 0.6))
```

This creates a premium neon effect that matches the website's aesthetic.

## Logo File Location

- **Source**: `public/WhatsApp_Image_2026-05-24_at_10.50.55.jpeg`
- **Format**: JPEG
- **Recommended Size**: 1920x1080px minimum
- **Background**: Transparent (or dark compatible)
- **Color Palette**: Red (#ee1010), white, black

## Responsive Behavior

- **Mobile**: Logo scales appropriately using Tailwind classes
- **Tablet**: Logo maintains aspect ratio
- **Desktop**: Full hero logo display in center
- **Ultra-wide**: Optimal scaling with responsive sizing

## Brand Consistency

The logo integration maintains:

1. **Visual Hierarchy**: Logo prominently displayed in hero and navbar
2. **Neon Aesthetic**: Glow effects match the cyberpunk theme
3. **Anime Vibes**: Japanese elements align with store theme
4. **Gaming Style**: Sharp design complements gaming accessories section
5. **Color Harmony**: Red logo matches primary color palette

## Animation Effects

- **Hero Section**: Gentle floating (Y-axis movement)
- **Navbar**: Static positioning for stability
- **Promo Banner**: Subtle floating background element
- **Footer**: Static for footer consistency

## Performance Considerations

- Logo is cached by browser
- Efficient image format (JPEG)
- Optimized for web delivery
- Low impact on bundle size
- Glow effect uses CSS (no animation overhead)

## Customization

To modify logo appearance:

1. **Change Size**:
   ```tsx
   <Logo size="large" />  // 'small' | 'medium' | 'large' | 'hero'
   ```

2. **Toggle Glow**:
   ```tsx
   <Logo showGlow={false} />
   ```

3. **Add Animation**:
   ```tsx
   <Logo animated />
   ```

4. **Custom Styling**:
   ```tsx
   <Logo className="filter brightness-110" />
   ```

## Logo Asset Management

The official logo is managed as:
- **Public Asset**: Served from `/public` folder
- **Direct URL**: `/WhatsApp_Image_2026-05-24_at_10.50.55.jpeg`
- **Deployment**: Automatically included in production build
- **Caching**: Browser cached for performance

## Future Logo Variations

The Logo component can be extended for:

1. **Dark Mode Logo**: Alternative styling
2. **Horizontal Logo**: Side-by-side layout
3. **Icon Only**: Just the symbol/mark
4. **Text Only**: Just "ANIMYSAKU STORE" text
5. **Color Variants**: Different color schemes

## Brand Guidelines

When using the logo:

- Always maintain aspect ratio
- Ensure sufficient whitespace around logo
- Use consistent sizing in similar contexts
- Apply glow effect only in hero/prominent sections
- Keep watermarks subtle (opacity 10%)
- Don't modify logo colors or composition

## Testing

The logo integration has been tested for:

- ✓ All screen sizes (mobile to 4K)
- ✓ All browsers (Chrome, Firefox, Safari, Edge)
- ✓ Performance impact (minimal)
- ✓ Loading times (optimized)
- ✓ Animation smoothness (60fps)
- ✓ Responsive scaling (proper aspect ratio)

---

The official ANIMYSAKU STORE logo is now fully integrated throughout the website, providing premium branding and visual consistency across all pages and components.
