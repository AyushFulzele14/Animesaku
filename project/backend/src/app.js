import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';

import { logger } from './config/logger.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import mongoSanitize from 'express-mongo-sanitize';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows browser fetching of local images
}));

// Enable CORS (frontend dev server + direct API access)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // allow dev tools / same-machine requests
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// HTTP request logging mapped to Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: { write: (message) => logger.http(message.trim()) },
  })
);

// Compression for optimal bandwidth usage
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize request payloads to prevent NoSQL query injections
app.use(mongoSanitize());

// Static directories for serving locally uploaded product assets
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Serve Swagger Docs API Documentation
const swaggerJsonPath = path.join(process.cwd(), 'src', 'swagger.json');
if (fs.existsSync(swaggerJsonPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerJsonPath, 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Global API rate limiting
app.use('/api', apiLimiter);

// Route Bindings
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);

// Base Check-alive endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the AnimySaku Store E-Commerce REST API',
    docs: '/api-docs',
    status: 'ONLINE',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ONLINE',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
