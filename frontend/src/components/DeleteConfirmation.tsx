import Modal from './Modal';

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmation({
  open,
  title = 'Delete item',
  message,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="space-y-4 rounded-md bg-white p-4 text-gray-900">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-700">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            type="button"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
