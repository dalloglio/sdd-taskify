import { NextFunction, Request, Response } from 'express'

// Minimal validation helper - replace with Joi/Zod in real implementation
export function requireBody(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = fields.filter((f) => !(f in req.body))
    if (missing.length) {
      res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` })
      return
    }
    next()
  }
}
