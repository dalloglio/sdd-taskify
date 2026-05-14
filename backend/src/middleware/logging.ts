import { NextFunction, Request, Response } from 'express';

export function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  // eslint-disable-next-line no-console
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}
