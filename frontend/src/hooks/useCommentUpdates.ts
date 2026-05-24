import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Comment } from '../types/models';
import { useSocket } from './useSocket';

type DeletePayload = {
  commentId: string;
  taskId: string;
};

function upsertComment(comments: Comment[] | undefined, comment: Comment) {
  if (!comments) return [comment];
  const exists = comments.some((item) => item.id === comment.id);
  return exists
    ? comments.map((item) => (item.id === comment.id ? comment : item))
    : [...comments, comment];
}

export function useCommentUpdates(projectId?: string, taskId?: string) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  useSocket(projectId, {
    'comment:added': (comment: Comment) => {
      if (comment.taskId !== taskId) return;
      queryClient.setQueryData<Comment[]>(['comments', taskId], (old) =>
        upsertComment(old, comment)
      );
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setMessage('Comment added');
    },
    'comment:updated': (comment: Comment) => {
      if (comment.taskId !== taskId) return;
      queryClient.setQueryData<Comment[]>(['comments', taskId], (old) =>
        upsertComment(old, comment)
      );
      setMessage('Comment updated');
    },
    'comment:deleted': (payload: DeletePayload) => {
      if (payload.taskId !== taskId) return;
      queryClient.setQueryData<Comment[] | undefined>(
        ['comments', taskId],
        (old) =>
          old ? old.filter((comment) => comment.id !== payload.commentId) : old
      );
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setMessage('Comment deleted');
    },
    'comment:error': () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setMessage('Comment update failed');
    },
  });

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(''), 2500);
    return () => window.clearTimeout(timer);
  }, [message]);

  return { message };
}
