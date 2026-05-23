import { Project } from '../types/models';
import { SampleProjectSummary } from '../types/sampleData';
import ProjectPreview from './ProjectPreview';
import UserAvatar from './UserAvatar';

export default function ProjectCard({
  project,
  preview,
}: {
  project: Project;
  preview?: SampleProjectSummary;
}) {
  return (
    <div className="border rounded p-3 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">{project.name}</div>
        {project.isSample && (
          <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            Sample
          </span>
        )}
      </div>
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
      <ProjectPreview summary={preview} />
    </div>
  );
}
