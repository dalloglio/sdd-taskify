import { Task, TaskStatus, User } from '../types/models';
import { getStatusLabel, KANBAN_COLUMNS } from '../utils/kanban';
import AssigneeSelector from './AssigneeSelector';
import UserAvatar from './UserAvatar';

type Props = {
  task: Task;
  members: User[];
  onStatusChange: (status: TaskStatus) => void;
  onAssigneeChange: (assigneeId: string | null) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function TaskDetails({
  task,
  members,
  onStatusChange,
  onAssigneeChange,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="space-y-5 text-gray-900">
      <div>
        <h2 className="text-2xl font-bold">{task.title}</h2>
        <p className="mt-2 whitespace-pre-wrap text-base text-gray-700">
          {task.description || 'No description provided.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="detail-status">
            Status
          </label>
          <select
            id="detail-status"
            className="input w-full bg-white text-gray-900 border-gray-300"
            value={task.status}
            onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
          >
            {KANBAN_COLUMNS.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="detail-assignee">
            Assignee
          </label>
          <AssigneeSelector
            id="detail-assignee"
            members={members}
            value={task.assignee?.id ?? null}
            onChange={onAssigneeChange}
          />
        </div>
      </div>

      <div className="rounded-md bg-gray-50 p-3">
        <p className="text-sm font-semibold text-gray-700">Current assignee</p>
        {task.assignee ? (
          <div className="mt-2 flex items-center gap-2">
            <UserAvatar user={task.assignee} size={32} />
            <span>{task.assignee.name}</span>
          </div>
        ) : (
          <p className="mt-2 italic text-gray-500">Unassigned</p>
        )}
      </div>

      <div className="rounded-md bg-gray-50 p-3">
        <p className="text-sm font-semibold text-gray-700">Comments</p>
        <p className="mt-1 text-sm text-gray-600">
          {task.commentCount
            ? `${task.commentCount} comments available in the task thread.`
            : 'No comments yet'}
        </p>
      </div>

      <div className="flex justify-between gap-2">
        <span className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-800">
          {getStatusLabel(task.status)}
        </span>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700"
            type="button"
            onClick={onEdit}
          >
            Edit task
          </button>
          <button
            className="rounded-md border border-red-200 px-4 py-2 text-red-600"
            type="button"
            onClick={onDelete}
          >
            Delete task
          </button>
        </div>
      </div>
    </div>
  );
}
