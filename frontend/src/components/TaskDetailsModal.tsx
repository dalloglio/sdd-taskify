import { Task, TaskStatus, User } from '../types/models';
import Modal from './Modal';
import TaskDetails from './TaskDetails';
import TaskForm, { TaskFormValues } from './TaskForm';

type Props = {
  open: boolean;
  task: Task | null;
  members: User[];
  editing: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSubmitEdit: (values: TaskFormValues) => Promise<void> | void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onAssigneeChange: (task: Task, assigneeId: string | null) => void;
  onDelete: (task: Task) => void;
};

export default function TaskDetailsModal({
  open,
  task,
  members,
  editing,
  onClose,
  onEdit,
  onCancelEdit,
  onSubmitEdit,
  onStatusChange,
  onAssigneeChange,
  onDelete,
}: Props) {
  if (!task) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="rounded-md bg-white p-4">
        {editing ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Edit Task</h2>
            <TaskForm
              members={members}
              initialTask={task}
              onSubmit={onSubmitEdit}
              onCancel={onCancelEdit}
              submitLabel="Save Task"
            />
          </div>
        ) : (
          <TaskDetails
            task={task}
            members={members}
            onStatusChange={(status) => onStatusChange(task, status)}
            onAssigneeChange={(assigneeId) =>
              onAssigneeChange(task, assigneeId)
            }
            onEdit={onEdit}
            onDelete={() => onDelete(task)}
          />
        )}
      </div>
    </Modal>
  );
}
