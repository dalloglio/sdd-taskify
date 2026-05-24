import { FormEvent, useState } from 'react';
import { Task, User } from '../types/models';
import AssigneeSelector from './AssigneeSelector';
import Button from './Button';

export type TaskFormValues = {
  title: string;
  description?: string;
  assigneeId?: string | null;
};

type Props = {
  members: User[];
  initialTask?: Task | null;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
};

export default function TaskForm({
  members,
  initialTask,
  onSubmit,
  onCancel,
  submitLabel = 'Create Task',
}: Props) {
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [description, setDescription] = useState(
    initialTask?.description ?? ''
  );
  const [assigneeId, setAssigneeId] = useState<string | null>(
    initialTask?.assignee?.id ?? null
  );
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }

    setError('');
    await onSubmit({
      title: trimmedTitle,
      description: description.trim() || undefined,
      assigneeId,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          className="block text-sm font-medium text-gray-700"
          htmlFor="task-title"
        >
          Title
        </label>
        <input
          id="task-title"
          className="input w-full bg-white text-gray-900 border-gray-300"
          maxLength={255}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-700"
          htmlFor="task-description"
        >
          Description
        </label>
        <textarea
          id="task-description"
          className="input min-h-24 w-full bg-white text-gray-900 border-gray-300"
          maxLength={5000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-700"
          htmlFor="assignee"
        >
          Assignee
        </label>
        <AssigneeSelector
          members={members}
          value={assigneeId}
          onChange={setAssigneeId}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
