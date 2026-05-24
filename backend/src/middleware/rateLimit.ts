import { NextFunction, Request, Response } from 'express';

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  now?: () => number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

export function createRateLimit(options: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();
  const now = options.now ?? Date.now;
  const keyGenerator =
    options.keyGenerator ??
    ((req: Request) => req.ip || req.socket.remoteAddress || 'anonymous');

  return (req: Request, res: Response, next: NextFunction) => {
    const currentTime = now();
    const key = keyGenerator(req);
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= currentTime) {
      buckets.set(key, {
        count: 1,
        resetAt: currentTime + options.windowMs,
      });
      next();
      return;
    }

    bucket.count += 1;

    if (bucket.count > options.maxRequests) {
      const retryAfterSeconds = Math.ceil(
        (bucket.resetAt - currentTime) / 1000
      );
      res.setHeader('Retry-After', String(Math.max(retryAfterSeconds, 1)));
      res.status(429).json({
        error: 'Too many requests. Please retry shortly.',
      });
      return;
    }

    next();
  };
}

export const apiRateLimit = createRateLimit({
  windowMs: 60_000,
  maxRequests: 120,
});
