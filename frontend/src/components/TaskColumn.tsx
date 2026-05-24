import { useDroppable } from '@dnd-kit/core';
import { Task, TaskStatus, User } from '../types/models';
import { KANBAN_COLUMNS } from '../utils/kanban';
import TaskCard from './TaskCard';

type Props = {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  currentUser?: User | null;
  onCreateTask: () => void;
  onOpenTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
};

export default function TaskColumn({
  status,
  title,
  tasks,
  currentUser,
  onCreateTask,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const borderClass =
    KANBAN_COLUMNS.find((column) => column.id === status)?.borderClass ??
    'border-gray-400';

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-screen flex-col rounded-lg border-t-4 bg-gray-100 p-4 ${borderClass} ${
        isOver ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-600">({tasks.length} tasks)</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={currentUser}
              onOpen={onOpenTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-600">
            <p>No tasks in this column</p>
            {status === 'to_do' && (
              <button
                className="mt-2 font-medium text-blue-700"
                type="button"
                onClick={onCreateTask}
              >
                Create the first task
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
