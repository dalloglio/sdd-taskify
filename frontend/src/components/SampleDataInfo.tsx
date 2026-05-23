import { SampleDataSummary } from '../types/sampleData';

type Props = {
  summary?: SampleDataSummary;
  isLoading?: boolean;
};

export default function SampleDataInfo({ summary, isLoading = false }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-600">
        Loading sample workspace...
      </div>
    );
  }

  if (!summary) return null;

  const stats = [
    { label: 'Users', value: summary.usersCount },
    { label: 'Projects', value: summary.projectsCount },
    { label: 'Tasks', value: summary.tasksCount },
    { label: 'Comments', value: summary.commentsCount },
  ];

  return (
    <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
      <div className="text-sm font-semibold text-blue-900">
        Sample workspace loaded
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded bg-white px-3 py-2">
            <div className="text-lg font-semibold text-gray-900">
              {stat.value}
            </div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
