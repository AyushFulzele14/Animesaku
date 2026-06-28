import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger.js';

export const configureCloudinary = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    logger.warn('Cloudinary environment variables missing. Image uploads will fall back to local URLs or mock URLs.');
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  logger.info('Cloudinary configured successfully');
};

export default cloudinary;
