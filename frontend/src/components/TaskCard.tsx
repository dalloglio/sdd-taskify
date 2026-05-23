import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type React from 'react';
import { useState } from 'react';
import { Task, TaskStatus, User } from '../types/models';
import { getStatusLabel, KANBAN_COLUMNS } from '../utils/kanban';
import UserAvatar from './UserAvatar';

type Props = {
  task: Task;
  currentUser?: User | null;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
};

export default function TaskCard({
  task,
  currentUser,
  onOpen,
  onEdit,
  onDelete,
  onStatusChange,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isCurrentUserTask = Boolean(task.assignee?.id && task.assignee.id === currentUser?.id);
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: { task },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };
  const badgeClass =
    KANBAN_COLUMNS.find((column) => column.id === task.status)?.badgeClass ??
    'bg-gray-200 text-gray-800';

  function stopMenuClick(event: React.MouseEvent) {
    event.stopPropagation();
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`relative rounded-md border bg-white p-3 text-left shadow-sm transition ${
        isCurrentUserTask ? 'border-l-4 border-l-blue-500' : 'border-gray-200'
      } ${isDragging ? 'opacity-60' : ''}`}
      onClick={() => onOpen(task)}
    >
      <div className="flex items-start gap-2">
        <button
          ref={setActivatorNodeRef}
          className="min-w-0 flex-1 cursor-grab text-left active:cursor-grabbing"
          type="button"
          {...listeners}
          {...attributes}
          aria-label={`Drag ${task.title}`}
        >
          <h4 className="truncate text-base font-bold text-gray-900">{task.title}</h4>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{task.description}</p>
          )}
        </button>
        <button
          className="rounded px-2 text-xl leading-none text-gray-500 hover:bg-gray-100"
          type="button"
          aria-label={`Open actions for ${task.title}`}
          onClick={(event) => {
            stopMenuClick(event);
            setMenuOpen((open) => !open);
          }}
        >
          ...
        </button>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        {task.assignee ? (
          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar user={task.assignee} size={24} />
            <div className="min-w-0">
              <p className="truncate text-sm text-gray-800">{task.assignee.name}</p>
              {task.assignee.role && (
                <p className="text-xs capitalize text-gray-500">
                  {task.assignee.role.replace('_', ' ')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm italic text-gray-500">Unassigned</p>
        )}
        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${badgeClass}`}>
          {getStatusLabel(task.status)}
        </span>
      </div>

      {menuOpen && (
        <div
          className="absolute right-3 top-9 z-10 w-44 rounded-md border border-gray-200 bg-white p-1 shadow-lg"
          onClick={stopMenuClick}
        >
          {KANBAN_COLUMNS.map((column) => (
            <button
              key={column.id}
              className="block w-full rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              type="button"
              onClick={() => {
                onStatusChange(task, column.id);
                setMenuOpen(false);
              }}
            >
              {column.title}
            </button>
          ))}
          <div className="my-1 border-t border-gray-200" />
          <button
            className="block w-full rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            type="button"
            onClick={() => {
              onEdit(task);
              setMenuOpen(false);
            }}
          >
            Edit task
          </button>
          <button
            className="block w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            type="button"
            onClick={() => {
              onDelete(task);
              setMenuOpen(false);
            }}
          >
            Delete task
          </button>
        </div>
      )}
    </article>
  );
}
