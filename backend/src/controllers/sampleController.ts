import { Request, Response } from 'express';
import * as sampleService from '../services/sampleService';
import { fail, ok } from '../utils/response';

export async function getSampleData(_req: Request, res: Response) {
  try {
    const summary = await sampleService.getSampleDataSummary();
    return ok(res, summary);
  } catch (err: any) {
    return fail(res, err.message || 'Failed to load sample data summary');
  }
}

export default { getSampleData };
