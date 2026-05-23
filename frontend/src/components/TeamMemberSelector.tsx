import { useGetUsers } from '../hooks/useUsers';
import { User } from '../types/models';

export default function TeamMemberSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const { data: users } = useGetUsers();

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  return (
    <div className="max-h-48 overflow-auto rounded border border-gray-300 bg-white p-2 text-gray-900">
      {users?.map((u: User) => (
        <label
          key={u.id}
          className="flex items-center gap-2 rounded px-2 py-1 cursor-pointer hover:bg-gray-50"
        >
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={value.includes(u.id)}
            onChange={() => toggle(u.id)}
          />
          <span className="text-sm text-gray-800">{u.name}</span>
        </label>
      ))}
    </div>
  );
}
