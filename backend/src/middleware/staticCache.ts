import { NextFunction, Request, Response } from 'express';

const STATIC_ASSET_PATTERN =
  /\.(?:avif|css|gif|ico|jpeg|jpg|js|map|png|svg|webp|woff2?)$/i;

export function staticCacheHeaders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.method === 'GET' && STATIC_ASSET_PATTERN.test(req.path)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  next();
}
