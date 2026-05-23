import { NextFunction, Request, Response } from 'express';

export function requireCurrentUser() {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId =
      req.header('x-current-user-id') || req.body.authorId || req.body.currentUserId;

    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ error: 'Current user is required' });
      return;
    }

    next();
  };
}
