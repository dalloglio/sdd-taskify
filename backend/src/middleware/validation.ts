import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const uuidSchema = z.string().uuid();

function validationError(res: Response, error: z.ZodError) {
  const msg = error.errors.map((e) => e.message).join('; ');
  res.status(400).json({ error: msg });
}

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
  const schema = z
    .object({
      name: z.string().trim().min(1, 'name is required').max(255),
      description: z.string().trim().max(5000).optional(),
      memberIds: z.array(uuidSchema).optional(),
    })
    .strict();
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }
    req.body = parsed.data;
    next();
  };
}

const taskStatusSchema = z.enum(['to_do', 'in_progress', 'in_review', 'done']);

export function validateCreateTask() {
  const schema = z
    .object({
      title: z.string().trim().min(1, 'title is required').max(255),
      description: z.string().trim().max(5000).optional(),
      assigneeId: uuidSchema.nullable().optional(),
      status: taskStatusSchema.optional(),
      createdById: uuidSchema.optional(),
    })
    .strict();

  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateUpdateTask() {
  const schema = z
    .object({
      title: z
        .string()
        .trim()
        .min(1, 'title must not be empty')
        .max(255)
        .optional(),
      description: z.string().trim().max(5000).nullable().optional(),
      assigneeId: uuidSchema.nullable().optional(),
      status: taskStatusSchema.optional(),
    })
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field must be provided',
    });

  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateUpdateTaskStatus() {
  const schema = z
    .object({
      status: taskStatusSchema,
    })
    .strict();

  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateCreateComment() {
  const schema = z
    .object({
      text: z.string().trim().min(1, 'comment text is required').max(5000),
      authorId: uuidSchema.optional(),
      currentUserId: uuidSchema.optional(),
    })
    .strict();

  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateUpdateComment() {
  const schema = z
    .object({
      text: z.string().trim().min(1, 'comment text is required').max(5000),
      currentUserId: uuidSchema.optional(),
    })
    .strict();

  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateProjectParams() {
  const schema = z.object({ projectId: uuidSchema });
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }
    next();
  };
}

export function validateTaskParams() {
  const schema = z.object({ taskId: uuidSchema });
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }
    next();
  };
}

export function validateCommentParams() {
  const schema = z.object({ commentId: uuidSchema });
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }
    next();
  };
}

export function validateAddProjectMember() {
  const schema = z.object({ userId: uuidSchema }).strict();
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateTaskListQuery() {
  const schema = z
    .object({
      status: taskStatusSchema.optional(),
      assigneeId: uuidSchema.optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      offset: z.coerce.number().int().min(0).optional(),
    })
    .strict();

  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      validationError(res, parsed.error);
      return;
    }
    req.query = parsed.data as typeof req.query;
    next();
  };
}
