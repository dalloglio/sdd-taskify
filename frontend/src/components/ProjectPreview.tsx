import { SampleProjectSummary } from '../types/sampleData';

type Props = {
  summary?: SampleProjectSummary;
};

export default function ProjectPreview({ summary }: Props) {
  if (!summary) return null;

  return (
    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
      <div className="rounded bg-gray-50 px-2 py-1">
        <div className="font-semibold text-gray-900">{summary.membersCount}</div>
        <div className="text-gray-500">Members</div>
      </div>
      <div className="rounded bg-gray-50 px-2 py-1">
        <div className="font-semibold text-gray-900">{summary.tasksCount}</div>
        <div className="text-gray-500">Tasks</div>
      </div>
      <div className="rounded bg-gray-50 px-2 py-1">
        <div className="font-semibold text-gray-900">
          {summary.commentsCount}
        </div>
        <div className="text-gray-500">Comments</div>
      </div>
    </div>
  );
}
