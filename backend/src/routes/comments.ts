import { Router } from 'express';
import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
} from '../controllers/commentController';
import { requireCurrentUser } from '../middleware/authorization';
import {
  validateCreateComment,
  validateUpdateComment,
} from '../middleware/validation';

const router = Router();

router.get('/tasks/:taskId/comments', listComments);
router.post(
  '/tasks/:taskId/comments',
  validateCreateComment(),
  requireCurrentUser(),
  createComment
);
router.patch(
  '/comments/:commentId',
  validateUpdateComment(),
  requireCurrentUser(),
  updateComment
);
router.delete('/comments/:commentId', requireCurrentUser(), deleteComment);

export default router;
