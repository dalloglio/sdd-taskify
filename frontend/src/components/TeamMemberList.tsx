import { User } from '../types/models';
import UserAvatar from './UserAvatar';

export default function TeamMemberList({ members }: { members: User[] }) {
  if (!members?.length)
    return <div className="text-sm text-gray-500">No members yet.</div>;
  return (
    <ul className="space-y-2">
      {members.map((m) => (
        <li key={m.id} className="flex items-center gap-2">
          <UserAvatar user={m} />
          <span>{m.name}</span>
        </li>
      ))}
    </ul>
  );
}
