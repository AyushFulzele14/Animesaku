/*
  # Seed Initial Products

  Insert sample products for the ANIMYSAKU STORE.
*/

INSERT INTO products (name, description, price, sale_price, image_url, category, rating, reviews, is_sale)
VALUES
  (
    'Sakura Night Poster',
    'Premium glossy poster with neon sakura design',
    24.99,
    NULL,
    'https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg?w=400&h=400&fit=crop',
    'Posters',
    5,
    124,
    false
  ),
  (
    'Neon Red Hoodie',
    'Comfortable anime-inspired hoodie with glowing accents',
    79.99,
    59.99,
    'https://images.pexels.com/photos/3622613/pexels-photo-3622613.jpeg?w=400&h=400&fit=crop',
    'Hoodies',
    4.5,
    89,
    true
  ),
  (
    'Gaming Mouse Pad',
    'Extended RGB mouse pad with anime artwork',
    34.99,
    NULL,
    'https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?w=400&h=400&fit=crop',
    'Gaming Accessories',
    5,
    156,
    false
  ),
  (
    'Anime Sticker Pack',
    'Set of 50 premium holographic anime stickers',
    9.99,
    NULL,
    'https://images.pexels.com/photos/3616956/pexels-photo-3616956.jpeg?w=400&h=400&fit=crop',
    'Stickers',
    4.8,
    342,
    false
  ),
  (
    'Keychain Collection',
    'Premium metallic keychains with anime characters',
    14.99,
    NULL,
    'https://images.pexels.com/photos/3392096/pexels-photo-3392096.jpeg?w=400&h=400&fit=crop',
    'Keychains',
    4.7,
    267,
    false
  ),
  (
    'Manga Volume Set',
    'Limited edition manga collection with exclusive art',
    64.99,
    NULL,
    'https://images.pexels.com/photos/3537085/pexels-photo-3537085.jpeg?w=400&h=400&fit=crop',
    'Manga Accessories',
    4.9,
    198,
    false
  ),
  (
    'Gaming Backpack',
    'Premium anime-themed gaming backpack with USB charging',
    89.99,
    79.99,
    'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?w=400&h=400&fit=crop',
    'Gaming Accessories',
    4.6,
    145,
    true
  ),
  (
    'Anime T-Shirt Classic',
    'Premium comfort fit t-shirt with iconic anime design',
    29.99,
    NULL,
    'https://images.pexels.com/photos/3622639/pexels-photo-3622639.jpeg?w=400&h=400&fit=crop',
    'Hoodies',
    4.8,
    234,
    false
  ),
  (
    'LED Gaming Desk Lamp',
    'RGB desk lamp with anime aesthetic and smart controls',
    49.99,
    NULL,
    'https://images.pexels.com/photos/3394581/pexels-photo-3394581.jpeg?w=400&h=400&fit=crop',
    'Gaming Accessories',
    4.9,
    178,
    false
  ),
  (
    'Sakura Ceramic Mug',
    'Premium ceramic mug with glowing sakura pattern',
    19.99,
    NULL,
    'https://images.pexels.com/photos/3407617/pexels-photo-3407617.jpeg?w=400&h=400&fit=crop',
    'Stickers',
    5,
    89,
    false
  ),
  (
    'Anime Wall Scroll',
    'Premium fabric wall scroll with vibrant neon design',
    34.99,
    24.99,
    'https://images.pexels.com/photos/3651356/pexels-photo-3651356.jpeg?w=400&h=400&fit=crop',
    'Posters',
    4.7,
    112,
    true
  ),
  (
    'Gaming Keyboard RGB',
    'Mechanical gaming keyboard with anime keycaps',
    129.99,
    NULL,
    'https://images.pexels.com/photos/3558618/pexels-photo-3558618.jpeg?w=400&h=400&fit=crop',
    'Gaming Accessories',
    4.9,
    267,
    false
  )
ON CONFLICT DO NOTHING;
