import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ApiResponse } from '../types/api';
import { Comment, User } from '../types/models';

export function useGetComments(taskId?: string) {
  return useQuery<Comment[]>({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const res = await api.get<ApiResponse<Comment[]>>(
        `/tasks/${taskId}/comments`
      );
      return res.data.data;
    },
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId: string, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { text: string; authorId: string; author?: User }) => {
      const res = await api.post<ApiResponse<Comment>>(
        `/tasks/${taskId}/comments`,
        { text: payload.text, authorId: payload.authorId }
      );
      return res.data.data;
    },
    onMutate: async (newComment) => {
      await qc.cancelQueries({ queryKey: ['comments', taskId] });
      const previous = qc.getQueryData<Comment[]>(['comments', taskId]);
      if (newComment.author) {
        const optimistic: Comment = {
          id: `temp-${Date.now()}`,
          taskId,
          projectId,
          text: newComment.text,
          author: newComment.author,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        qc.setQueryData<Comment[]>(['comments', taskId], (old) =>
          old ? [...old, optimistic] : [optimistic]
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      qc.setQueryData(['comments', taskId], context?.previous ?? []);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['comments', taskId] });
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}

export function useUpdateComment(taskId: string, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      commentId: string;
      text: string;
      currentUserId: string;
    }) => {
      const res = await api.patch<ApiResponse<Comment>>(
        `/comments/${payload.commentId}`,
        { text: payload.text, currentUserId: payload.currentUserId }
      );
      return res.data.data;
    },
    onMutate: async ({ commentId, text }) => {
      await qc.cancelQueries({ queryKey: ['comments', taskId] });
      const previous = qc.getQueryData<Comment[]>(['comments', taskId]);
      qc.setQueryData<Comment[] | undefined>(['comments', taskId], (old) =>
        old
          ? old.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    text,
                    updatedAt: new Date().toISOString(),
                  }
                : comment
            )
          : old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      qc.setQueryData(['comments', taskId], context?.previous ?? []);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['comments', taskId] });
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}

export function useDeleteComment(taskId: string, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { commentId: string; currentUserId: string }) => {
      await api.delete(`/comments/${payload.commentId}`, {
        data: { currentUserId: payload.currentUserId },
      });
      return payload.commentId;
    },
    onMutate: async ({ commentId }) => {
      await qc.cancelQueries({ queryKey: ['comments', taskId] });
      const previous = qc.getQueryData<Comment[]>(['comments', taskId]);
      qc.setQueryData<Comment[] | undefined>(['comments', taskId], (old) =>
        old ? old.filter((comment) => comment.id !== commentId) : old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      qc.setQueryData(['comments', taskId], context?.previous ?? []);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['comments', taskId] });
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}
