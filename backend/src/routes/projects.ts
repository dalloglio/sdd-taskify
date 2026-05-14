import { Router } from 'express';
import {
  addMember,
  createProject,
  getProject,
  listProjects,
} from '../controllers/projectController';
import { requireBody, validateCreateProject } from '../middleware/validation';

const router = Router();

router.get('/', listProjects);
router.post('/', validateCreateProject(), createProject);
router.get('/:projectId', getProject);
router.post('/:projectId/members', requireBody(['userId']), addMember);

export default router;
