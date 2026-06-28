import { User } from '../models/User.js';
import { Cart } from '../models/Cart.js';
import { logger } from '../config/logger.js';

const ADMIN_EMAIL = 'admin@animysaku.com';
const ADMIN_PASSWORD = 'adminpassword123';

/**
 * Guarantees a default admin account exists (safe for dev; does not reset passwords).
 */
export async function ensureAdminUser() {
  let admin = await User.findOne({ email: ADMIN_EMAIL });

  if (!admin) {
    admin = await User.create({
      name: 'AnimySaku Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    await Cart.create({ user: admin._id, items: [] });
    logger.info(`Default admin created → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    return;
  }

  let updated = false;
  if (admin.role !== 'admin') {
    admin.role = 'admin';
    updated = true;
  }

  if (updated) {
    await admin.save();
    logger.info(`Updated ${ADMIN_EMAIL} to admin role`);
  }
}
