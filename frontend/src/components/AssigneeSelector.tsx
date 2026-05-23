import { User } from '../types/models';

type Props = {
  members: User[];
  value?: string | null;
  onChange: (userId: string | null) => void;
  id?: string;
};

export default function AssigneeSelector({
  members,
  value,
  onChange,
  id = 'assignee',
}: Props) {
  return (
    <select
      id={id}
      className="input w-full"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || null)}
    >
      <option value="">Unassigned</option>
      {members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name}
        </option>
      ))}
    </select>
  );
}
