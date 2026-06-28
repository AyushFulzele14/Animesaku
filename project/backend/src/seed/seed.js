import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Cart } from '../models/Cart.js';
import { Coupon } from '../models/Coupon.js';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';

const seedDatabase = async () => {
  try {
    console.log('--- Database Seeding Script Initializing ---');
    await connectDB();

    // 1. Clear Existing Collections
    console.log('Wiping existing database collections...');
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Cart.deleteMany();
    await Coupon.deleteMany();
    await Review.deleteMany();
    await Order.deleteMany();
    console.log('Database wiped successfully.');

    // 2. Seed Default Categories
    console.log('Seeding categories...');
    const categoriesData = [
      { name: 'Anime Posters' },
      { name: 'Anime Stickers' },
      { name: 'Combo Packs' },
    ];
    
    const seededCategories = await Promise.all(
      categoriesData.map((cat) => Category.create(cat))
    );
    console.log(`Seeded ${seededCategories.length} categories.`);

    // Map Category names to ObjectIds for product insertions
    const categoryMap = {};
    seededCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // 3. Seed Default Coupons
    console.log('Seeding coupons...');
    const couponsData = [
      {
        code: 'ANIME20',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscountAmount: 150,
        minOrderAmount: 299,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days valid
        isActive: true,
      },
      {
        code: 'FIRST100',
        discountType: 'flat',
        discountValue: 100,
        minOrderAmount: 499,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ];
    const seededCoupons = await Coupon.insertMany(couponsData);
    console.log(`Seeded ${seededCoupons.length} discount coupons.`);

    // 4. Seed Default Users
    console.log('Creating standard test users...');
    
    // Admin User
    const adminUser = await User.create({
      name: 'AnimySaku Admin',
      email: 'admin@animysaku.com',
      password: 'adminpassword123', // Will be hashed automatically by user Schema hooks
      role: 'admin',
      avatar: {
        public_id: '',
        url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=200&h=200&fit=crop',
      },
      addresses: [
        {
          street: 'Main Admin Sector, Floor 3',
          city: 'Tokyo',
          state: 'Kanto',
          zipCode: '100-0001',
          phoneNumber: '9876543210',
          isDefault: true,
        },
      ],
    });
    // Create Cart for Admin
    await Cart.create({ user: adminUser._id, items: [] });

    // Customer User
    const customerUser = await User.create({
      name: 'Goku Otaku',
      email: 'otaku@animysaku.com',
      password: 'otakupassword123',
      role: 'customer',
      avatar: {
        public_id: '',
        url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=200&h=200&fit=crop',
      },
      addresses: [
        {
          street: 'Flat 402, Saiyan Towers',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          phoneNumber: '8765432109',
          isDefault: true,
        },
      ],
    });
    // Create Cart for Customer
    await Cart.create({ user: customerUser._id, items: [] });

    console.log('Created standard users:');
    console.log(`- ADMIN:    email: admin@animysaku.com  | password: adminpassword123`);
    console.log(`- CUSTOMER: email: otaku@animysaku.com  | password: otakupassword123`);

    // 5. Seed Products
    console.log('Seeding products...');
    const productSeedFilePath = path.join(process.cwd(), 'src', 'seed', 'productSeed.json');
    const rawProducts = JSON.parse(fs.readFileSync(productSeedFilePath, 'utf8'));

    const mappedProducts = rawProducts.map((p) => {
      const categoryId = categoryMap[p.categoryName] || seededCategories[0]._id;
      // Remove temporary helper field
      const { categoryName, ...rest } = p;
      return {
        ...rest,
        category: categoryId,
      };
    });

    const seededProducts = await Product.insertMany(mappedProducts);
    console.log(`Seeded ${seededProducts.length} anime products.`);

    // 6. Seed a sample Review for product 1
    console.log('Seeding product reviews...');
    await Review.create({
      product: seededProducts[0]._id,
      user: customerUser._id,
      name: customerUser.name,
      rating: 5,
      comment: 'Absolutely legendary quality! The neon sakura glow is gorgeous on my gaming wall!',
    });
    console.log('Review seeded successfully.');

    console.log('--- Database Seeding Completed Successfully ---');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
