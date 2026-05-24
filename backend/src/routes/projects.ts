import { Router } from 'express';
import {
  addMember,
  createProject,
  getProject,
  listProjects,
} from '../controllers/projectController';
import { requireProjectMember } from '../middleware/projectAccess';
import {
  validateAddProjectMember,
  validateCreateProject,
  validateProjectParams,
} from '../middleware/validation';

const router = Router();

router.get('/', listProjects);
router.post('/', validateCreateProject(), createProject);
router.get(
  '/:projectId',
  validateProjectParams(),
  requireProjectMember(),
  getProject
);
router.post(
  '/:projectId/members',
  validateProjectParams(),
  validateAddProjectMember(),
  requireProjectMember(),
  addMember
);

export default router;
