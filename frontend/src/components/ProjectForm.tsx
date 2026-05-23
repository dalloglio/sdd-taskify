import { useId, useState } from 'react';
import TeamMemberSelector from './TeamMemberSelector';

export default function ProjectForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: {
    name: string;
    description?: string;
    memberIds?: string[];
  }) => void | Promise<void>;
  onCancel?: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const nameId = useId();
  const descriptionId = useId();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({
          name,
          description: description || undefined,
          memberIds,
        });
      }}
      className="space-y-3 text-gray-900"
    >
      <div>
        <label className="block text-sm mb-1 font-medium text-gray-700" htmlFor={nameId}>
          Name
        </label>
        <input
          id={nameId}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1 font-medium text-gray-700" htmlFor={descriptionId}>
          Description
        </label>
        <textarea
          id={descriptionId}
          className="min-h-24 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm mb-1 font-medium text-gray-700">Team Members</label>
        <TeamMemberSelector value={memberIds} onChange={setMemberIds} />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            className="px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          className="px-3 py-2 border rounded bg-blue-600 text-white"
          type="submit"
        >
          Create
        </button>
      </div>
    </form>
  );
}
