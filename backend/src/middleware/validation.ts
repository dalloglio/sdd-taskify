import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

// Minimal validation helper - replace with Joi/Zod in real implementation
export function requireBody(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = fields.filter((f) => !(f in req.body));
    if (missing.length) {
      res
        .status(400)
        .json({ error: `Missing required fields: ${missing.join(', ')}` });
      return;
    }
    next();
  };
}

export function validateCreateProject() {
  const schema = z.object({
    name: z.string().min(1, 'name is required'),
    description: z.string().optional(),
    memberIds: z.array(z.string().uuid()).optional(),
  });
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      res.status(400).json({ error: msg });
      return;
    }
    next();
  };
}
