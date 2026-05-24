import { Router } from 'express';
import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
} from '../controllers/commentController';
import { requireCurrentUser } from '../middleware/authorization';
import {
  requireCommentProjectMember,
  requireTaskProjectMember,
} from '../middleware/projectAccess';
import {
  validateCommentParams,
  validateCreateComment,
  validateTaskParams,
  validateUpdateComment,
} from '../middleware/validation';

const router = Router();

router.get(
  '/tasks/:taskId/comments',
  validateTaskParams(),
  requireTaskProjectMember(),
  listComments
);
router.post(
  '/tasks/:taskId/comments',
  validateTaskParams(),
  validateCreateComment(),
  requireCurrentUser(),
  requireTaskProjectMember(),
  createComment
);
router.patch(
  '/comments/:commentId',
  validateCommentParams(),
  validateUpdateComment(),
  requireCurrentUser(),
  requireCommentProjectMember(),
  updateComment
);
router.delete(
  '/comments/:commentId',
  validateCommentParams(),
  requireCurrentUser(),
  requireCommentProjectMember(),
  deleteComment
);

export default router;
