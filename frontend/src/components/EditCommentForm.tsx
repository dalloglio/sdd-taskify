import { FormEvent, useState } from 'react';

type Props = {
  initialText: string;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (text: string) => Promise<void> | void;
};

export default function EditCommentForm({
  initialText,
  submitting = false,
  onCancel,
  onSubmit,
}: Props) {
  const [text, setText] = useState(initialText);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    await onSubmit(trimmed);
  }

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <textarea
        aria-label="Edit comment"
        className="input min-h-[80px] w-full resize-y bg-white text-gray-900 border-gray-300"
        value={text}
        maxLength={5000}
        onChange={(event) => setText(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          type="submit"
          disabled={submitting || !text.trim()}
        >
          Save
        </button>
      </div>
    </form>
  );
}
