import mongoose from 'mongoose';
import { Product } from '../src/models/Product.js';

const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'animysaku';

try {
  await mongoose.connect(connStr, { dbName, maxPoolSize: 2 });
  const count = await Product.countDocuments();
  const products = await Product.find().sort('-createdAt').limit(5).lean();
  console.log('count', count);
  console.log(products.map(p => ({ id: p._id, title: p.title, animeName: p.animeName, type: p.type, createdAt: p.createdAt })));
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await mongoose.disconnect();
}
