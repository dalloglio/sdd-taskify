import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
  updateTaskStatus,
} from '../controllers/taskController';
import {
  validateCreateTask,
  validateProjectParams,
  validateTaskListQuery,
  validateTaskParams,
  validateUpdateTask,
  validateUpdateTaskStatus,
} from '../middleware/validation';
import {
  requireProjectMember,
  requireTaskProjectMember,
} from '../middleware/projectAccess';

const router = Router();

router.get(
  '/projects/:projectId/tasks',
  validateProjectParams(),
  validateTaskListQuery(),
  requireProjectMember(),
  listTasks
);
router.post(
  '/projects/:projectId/tasks',
  validateProjectParams(),
  validateCreateTask(),
  requireProjectMember(),
  createTask
);
router.get(
  '/tasks/:taskId',
  validateTaskParams(),
  requireTaskProjectMember(),
  getTask
);
router.patch(
  '/tasks/:taskId',
  validateTaskParams(),
  validateUpdateTask(),
  requireTaskProjectMember(),
  updateTask
);
router.patch(
  '/tasks/:taskId/status',
  validateTaskParams(),
  validateUpdateTaskStatus(),
  requireTaskProjectMember(),
  updateTaskStatus
);
router.delete(
  '/tasks/:taskId',
  validateTaskParams(),
  requireTaskProjectMember(),
  deleteTask
);

export default router;
