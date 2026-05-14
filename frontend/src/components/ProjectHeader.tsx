import { Project } from '../types/models';
import UserAvatar from './UserAvatar';

export default function ProjectHeader({ project }: { project: Project }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">{project.name}</h2>
        {project.description && (
          <p className="text-sm text-gray-600">{project.description}</p>
        )}
      </div>
      <div className="flex -space-x-2">
        {project.members?.slice(0, 6).map((m) => (
          <UserAvatar key={m.id} user={m as any} size={28} />
        ))}
      </div>
    </div>
  );
}
