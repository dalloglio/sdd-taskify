import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { fail, ok } from '../utils/response';

export async function getUsers(_req: Request, res: Response) {
  try {
    const users = await userService.getAllUsers();
    return ok(res, users);
  } catch (err: any) {
    return fail(res, err.message || 'Failed to get users');
  }
}

export default { getUsers };
