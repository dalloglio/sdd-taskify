import { useState } from 'react';
import { Comment, User } from '../types/models';
import UserAvatar from './UserAvatar';
import EditCommentForm from './EditCommentForm';

type Props = {
  comment: Comment;
  currentUser: User | null;
  onDelete: (comment: Comment) => void;
  onUpdate: (comment: Comment, text: string) => Promise<void> | void;
};

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function CommentItem({
  comment,
  currentUser,
  onDelete,
  onUpdate,
}: Props) {
  const [editing, setEditing] = useState(false);
  const canModify = Boolean(currentUser && currentUser.id === comment.author.id);

  return (
    <article className="rounded-md bg-gray-50 p-3 text-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <UserAvatar user={comment.author} size={32} />
          <span className="truncate text-sm font-semibold">
            {comment.author.name}
          </span>
        </div>
        <time className="shrink-0 text-xs text-gray-500">
          {formatTimestamp(comment.createdAt)}
        </time>
      </div>

      {editing ? (
        <div className="mt-3">
          <EditCommentForm
            initialText={comment.text}
            onCancel={() => setEditing(false)}
            onSubmit={async (text) => {
              await onUpdate(comment, text);
              setEditing(false);
            }}
          />
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap break-words text-base">
          {comment.text}
        </p>
      )}

      {canModify && !editing && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
            type="button"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600"
            type="button"
            onClick={() => onDelete(comment)}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
