import { createClient } from 'redis';
import { logger } from './logger.js';

let redisClient = null;
let isRedisConnected = false;

// High-speed in-memory fallback cache
const memoryCache = new Map();

export const connectRedis = async () => {
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    logger.warn('Redis URL or Host not configured in environment. Using high-speed in-memory cache fallback.');
    return;
  }

  const url = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;

  try {
    redisClient = createClient({
      url,
      socket: {
        // Stop infinite retry loops when Redis is not available.
        reconnectStrategy: () => false,
        connectTimeout: 5000,
      },
    });

    redisClient.on('error', (err) => {
      logger.error(`Redis Client Error: ${err.message}`);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('Connecting to Redis server...');
    });

    redisClient.on('ready', () => {
      logger.info('Redis server connected and ready');
      isRedisConnected = true;
    });

    await redisClient.connect();
  } catch (error) {
    logger.warn(`Redis connection failed: ${error.message}. Falling back to in-memory cache.`);
    redisClient = null;
    isRedisConnected = false;
  }
};

/**
 * Cache operations wrapper (transparently decides between Redis and Memory)
 */
export const cache = {
  get: async (key) => {
    try {
      if (isRedisConnected && redisClient) {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        const memItem = memoryCache.get(key);
        if (memItem) {
          if (memItem.expiry && memItem.expiry < Date.now()) {
            memoryCache.delete(key);
            return null;
          }
          return memItem.value;
        }
        return null;
      }
    } catch (error) {
      logger.error(`Cache Get Error for key '${key}': ${error.message}`);
      return null;
    }
  },

  set: async (key, value, ttlSeconds = 900) => {
    try {
      if (isRedisConnected && redisClient) {
        await redisClient.set(key, JSON.stringify(value), {
          EX: ttlSeconds,
        });
      } else {
        memoryCache.set(key, {
          value,
          expiry: Date.now() + ttlSeconds * 1000,
        });
      }
    } catch (error) {
      logger.error(`Cache Set Error for key '${key}': ${error.message}`);
    }
  },

  delete: async (key) => {
    try {
      if (isRedisConnected && redisClient) {
        await redisClient.del(key);
      } else {
        memoryCache.delete(key);
      }
    } catch (error) {
      logger.error(`Cache Delete Error for key '${key}': ${error.message}`);
    }
  },

  clearPattern: async (pattern) => {
    try {
      if (isRedisConnected && redisClient) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } else {
        const prefix = pattern.endsWith('*') ? pattern.slice(0, -1) : pattern;
        for (const key of memoryCache.keys()) {
          if (key.startsWith(prefix)) {
            memoryCache.delete(key);
          }
        }
      }
    } catch (error) {
      logger.error(`Cache Clear Pattern Error for pattern '${pattern}': ${error.message}`);
    }
  },
};
