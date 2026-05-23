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

const taskStatusSchema = z.enum(['to_do', 'in_progress', 'in_review', 'done']);

export function validateCreateTask() {
  const schema = z.object({
    title: z.string().min(1, 'title is required').max(255),
    description: z.string().max(5000).optional(),
    assigneeId: z.string().uuid().nullable().optional(),
    status: taskStatusSchema.optional(),
    createdById: z.string().uuid().optional(),
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

export function validateUpdateTask() {
  const schema = z
    .object({
      title: z.string().min(1, 'title must not be empty').max(255).optional(),
      description: z.string().max(5000).nullable().optional(),
      assigneeId: z.string().uuid().nullable().optional(),
      status: taskStatusSchema.optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field must be provided',
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

export function validateUpdateTaskStatus() {
  const schema = z.object({
    status: taskStatusSchema,
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
