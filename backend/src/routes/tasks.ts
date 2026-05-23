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
  validateUpdateTask,
  validateUpdateTaskStatus,
} from '../middleware/validation';

const router = Router();

router.get('/projects/:projectId/tasks', listTasks);
router.post('/projects/:projectId/tasks', validateCreateTask(), createTask);
router.get('/tasks/:taskId', getTask);
router.patch('/tasks/:taskId', validateUpdateTask(), updateTask);
router.patch('/tasks/:taskId/status', validateUpdateTaskStatus(), updateTaskStatus);
router.delete('/tasks/:taskId', deleteTask);

export default router;
