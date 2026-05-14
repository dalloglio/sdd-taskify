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
    <div className="max-h-48 overflow-auto border rounded p-2">
      {users?.map((u: User) => (
        <label
          key={u.id}
          className="flex items-center gap-2 py-1 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={value.includes(u.id)}
            onChange={() => toggle(u.id)}
          />
          <span>{u.name}</span>
        </label>
      ))}
    </div>
  );
}
