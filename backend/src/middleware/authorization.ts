import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const uuidSchema = z.string().uuid();

export function requireCurrentUser() {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId =
      req.header('x-current-user-id') ||
      req.body.authorId ||
      req.body.currentUserId;

    if (!uuidSchema.safeParse(userId).success) {
      res.status(401).json({ error: 'Current user is required' });
      return;
    }

    next();
  };
}
