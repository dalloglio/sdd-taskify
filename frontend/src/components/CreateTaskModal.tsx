import { TaskFormValues } from './TaskForm';
import TaskForm from './TaskForm';
import Modal from './Modal';
import { User } from '../types/models';

type Props = {
  open: boolean;
  members: User[];
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
};

export default function CreateTaskModal({
  open,
  members,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4 rounded-md bg-white p-4">
        <h2 className="text-lg font-semibold text-gray-900">Create Task</h2>
        <TaskForm members={members} onSubmit={onSubmit} onCancel={onClose} />
      </div>
    </Modal>
  );
}
