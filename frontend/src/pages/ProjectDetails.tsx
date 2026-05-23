import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import ProjectHeader from '../components/ProjectHeader';
import TeamMemberList from '../components/TeamMemberList';
import api from '../services/api';
import { ApiResponse } from '../types/api';
import { Project, User } from '../types/models';

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
      return res.data.data as Project;
    },
    enabled: !!projectId,
  });

  if (!project) return <div>Loading project…</div>;

  return (
    <div className="space-y-4">
      <ProjectHeader project={project} />
      <section>
        <h3 className="font-semibold mb-2">Team Members</h3>
        <TeamMemberList members={(project.members || []) as User[]} />
      </section>
      <section>
        <p className="text-sm text-gray-600">Kanban board will appear here.</p>
      </section>
    </div>
  );
}
