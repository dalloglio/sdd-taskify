import { Project } from '../types/models';
import UserAvatar from './UserAvatar';

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="border rounded p-3 hover:shadow-sm transition">
      <div className="font-medium">{project.name}</div>
      <div className="text-xs text-gray-500 mb-2">
        Created {new Date(project.createdAt).toLocaleDateString()}
      </div>
      <div className="flex -space-x-2">
        {project.members?.slice(0, 5).map((m) => (
          <div key={m.id} className="ring-2 ring-white rounded-full">
            <UserAvatar user={m as any} size={28} />
          </div>
        ))}
        {project.members && project.members.length > 5 && (
          <span className="text-xs ml-2">
            +{project.members.length - 5} more
          </span>
        )}
      </div>
    </div>
  );
}
