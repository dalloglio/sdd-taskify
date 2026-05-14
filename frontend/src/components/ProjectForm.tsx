import { useState } from 'react';
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
      className="space-y-3"
    >
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Description</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Team Members</label>
        <TeamMemberSelector value={memberIds} onChange={setMemberIds} />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            className="px-3 py-2 border rounded"
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
