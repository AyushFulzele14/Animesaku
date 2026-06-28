import { Category } from '../models/Category.js';
import { logger } from '../config/logger.js';
import { ensureAdminUser } from './ensureAdmin.js';

const DEFAULT_CATEGORIES = ['Anime Posters', 'Anime Stickers', 'Combo Packs'];

/**
 * Ensures admin user and baseline categories exist for a fresh local database.
 */
export async function ensureBootstrap() {
  await ensureAdminUser();

  const count = await Category.countDocuments();
  if (count > 0) return;

  for (const name of DEFAULT_CATEGORIES) {
    await Category.create({ name });
  }
  logger.info(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);
}
