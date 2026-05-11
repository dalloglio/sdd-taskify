import { ReactNode } from 'react';

type Props = {
  open: boolean;
  onClose?: () => void;
  children?: ReactNode;
};

export default function Modal({ open, onClose, children }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-4 w-full max-w-2xl">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-sm text-muted-foreground">
            Close
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
