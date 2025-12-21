import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Redis client for production
let redisClient;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
}

const createLimiter = (windowMs, max, message) => {
  const store = redisClient 
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:'
      })
    : undefined;

  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    store,
    keyGenerator: (req) => {
      return req.ip || req.headers['x-forwarded-for'] || 'unknown';
    }
  });
};

export const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  'Too many login attempts, please try again later.'
);

export const apiLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests, please try again later.'
);

export const uploadLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Upload limit exceeded. Please try again later.'
);