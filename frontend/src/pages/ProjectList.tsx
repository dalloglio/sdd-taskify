import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import SampleDataInfo from '../components/SampleDataInfo';
import { useCreateProject, useGetProjects } from '../hooks/useProjects';
import { useSampleData } from '../hooks/useSampleData';

export default function ProjectList() {
  const { data: projects, isLoading } = useGetProjects();
  const { data: sampleData, isLoading: sampleLoading } = useSampleData();
  const createMutation = useCreateProject();
  const [open, setOpen] = useState(false);
  const previewByProjectId = new Map(
    sampleData?.projects.map((project) => [project.id, project]) ?? []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button
          className="px-3 py-2 border rounded"
          onClick={() => setOpen(true)}
        >
          Create Project
        </button>
      </div>
      <SampleDataInfo summary={sampleData} isLoading={sampleLoading} />
      {isLoading && <div>Loading projects…</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects?.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`}>
            <ProjectCard project={p} preview={previewByProjectId.get(p.id)} />
          </Link>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="space-y-4 rounded-md bg-white p-4">
          <h2 className="text-lg font-semibold text-gray-900">Create Project</h2>
          <ProjectForm
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        </div>
      </Modal>
    </div>
  );
}
