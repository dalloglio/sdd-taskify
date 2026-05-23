import { Router } from 'express';
import { getSampleData } from '../controllers/sampleController';

const router = Router();

router.get('/sample-data', getSampleData);

export default router;
