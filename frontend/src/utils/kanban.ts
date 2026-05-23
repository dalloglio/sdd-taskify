import { TaskStatus } from '../types/models';

export const KANBAN_COLUMNS: {
  id: TaskStatus;
  title: string;
  badgeClass: string;
  borderClass: string;
}[] = [
  {
    id: 'to_do',
    title: 'To Do',
    badgeClass: 'bg-gray-200 text-gray-800',
    borderClass: 'border-gray-400',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    badgeClass: 'bg-blue-200 text-blue-900',
    borderClass: 'border-blue-500',
  },
  {
    id: 'in_review',
    title: 'In Review',
    badgeClass: 'bg-yellow-200 text-yellow-900',
    borderClass: 'border-yellow-500',
  },
  {
    id: 'done',
    title: 'Done',
    badgeClass: 'bg-green-200 text-green-900',
    borderClass: 'border-green-500',
  },
];

export function getStatusLabel(status: TaskStatus) {
  return KANBAN_COLUMNS.find((column) => column.id === status)?.title ?? status;
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return KANBAN_COLUMNS.some((column) => column.id === value);
}
