import { FormEvent, useState } from 'react';

type Props = {
  submitting?: boolean;
  onSubmit: (text: string) => Promise<void> | void;
};

export default function CommentForm({ submitting = false, onSubmit }: Props) {
  const [text, setText] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    await onSubmit(trimmed);
    setText('');
  }

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-gray-700" htmlFor="comment-text">
        Add comment
      </label>
      <textarea
        id="comment-text"
        className="input min-h-[88px] w-full resize-y bg-white text-gray-900 border-gray-300"
        value={text}
        maxLength={5000}
        onChange={(event) => setText(event.target.value)}
      />
      <div className="flex justify-end">
        <button
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          type="submit"
          disabled={submitting || !text.trim()}
        >
          Add Comment
        </button>
      </div>
    </form>
  );
}
