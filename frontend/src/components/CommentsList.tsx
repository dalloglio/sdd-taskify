import { useState } from 'react';
import { useUserStore } from '../context/userStore';
import { useCommentUpdates } from '../hooks/useCommentUpdates';
import {
  useCreateComment,
  useDeleteComment,
  useGetComments,
  useUpdateComment,
} from '../hooks/useComments';
import { Comment, Task } from '../types/models';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import DeleteConfirmation from './DeleteConfirmation';

type Props = {
  task: Task;
};

export default function CommentsList({ task }: Props) {
  const { currentUser } = useUserStore();
  const { data: comments = [], isLoading } = useGetComments(task.id);
  const visibleComments = comments.filter(
    (comment) => comment.author && comment.text
  );
  const createComment = useCreateComment(task.id, task.projectId);
  const updateComment = useUpdateComment(task.id, task.projectId);
  const deleteComment = useDeleteComment(task.id, task.projectId);
  const { message } = useCommentUpdates(task.projectId, task.id);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  async function handleCreate(text: string) {
    if (!currentUser) return;
    await createComment.mutateAsync({
      text,
      authorId: currentUser.id,
      author: currentUser,
    });
  }

  async function handleUpdate(comment: Comment, text: string) {
    if (!currentUser) return;
    await updateComment.mutateAsync({
      commentId: comment.id,
      text,
      currentUserId: currentUser.id,
    });
  }

  async function confirmDelete() {
    if (!deleteTarget || !currentUser) return;
    await deleteComment.mutateAsync({
      commentId: deleteTarget.id,
      currentUserId: currentUser.id,
    });
    setDeleteTarget(null);
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">Comments</h3>
        <span className="text-xs text-gray-500">{visibleComments.length}</span>
      </div>

      {message && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
          {message}
        </div>
      )}

      {isLoading ? (
        <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
          Loading comments...
        </p>
      ) : visibleComments.length ? (
        <div className="space-y-2">
          {visibleComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onDelete={setDeleteTarget}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
          No comments yet
        </p>
      )}

      {currentUser ? (
        <CommentForm
          submitting={createComment.isPending}
          onSubmit={handleCreate}
        />
      ) : (
        <p className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
          Select a user before adding comments.
        </p>
      )}

      <DeleteConfirmation
        open={Boolean(deleteTarget)}
        title="Delete comment"
        message="Delete this comment?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
