import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import { useCreateProject, useGetProjects } from '../hooks/useProjects';

export default function ProjectList() {
  const { data: projects, isLoading } = useGetProjects();
  const createMutation = useCreateProject();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button
          className="px-3 py-2 border rounded"
          onClick={() => setOpen(true)}
        >
          Create Project
        </button>
      </div>
      {isLoading && <div>Loading projects…</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects?.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`}>
            <ProjectCard project={p} />
          </Link>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded p-4 w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">New Project</h3>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>
            <ProjectForm
              onSubmit={async (values) => {
                await createMutation.mutateAsync(values);
                setOpen(false);
              }}
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
