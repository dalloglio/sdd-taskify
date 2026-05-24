import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import CreateTaskModal from '../components/CreateTaskModal';
import DeleteConfirmation from '../components/DeleteConfirmation';
import TaskCard from '../components/TaskCard';
import TaskColumn from '../components/TaskColumn';
import TaskDetailsModal from '../components/TaskDetailsModal';
import { useUserStore } from '../context/userStore';
import { useBoardUpdates } from '../hooks/useBoardUpdates';
import useDragDropSensors from '../hooks/useDragDrop';
import {
  useCreateTask,
  useDeleteTask,
  useGetTasks,
  useUpdateTask,
  useUpdateTaskStatus,
} from '../hooks/useTasks';
import { Project, Task, TaskStatus } from '../types/models';
import { isTaskStatus, KANBAN_COLUMNS } from '../utils/kanban';

type Props = {
  project: Project;
};

export default function KanbanBoard({ project }: Props) {
  const { currentUser } = useUserStore();
  const { data: tasks = [], isLoading } = useGetTasks(project.id);
  const createTask = useCreateTask(project.id);
  const updateTask = useUpdateTask(project.id);
  const updateTaskStatus = useUpdateTaskStatus(project.id);
  const deleteTask = useDeleteTask(project.id);
  const sensors = useDragDropSensors();
  const { message } = useBoardUpdates(project.id);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingDetails, setEditingDetails] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks]
  );

  const tasksByStatus = useMemo(() => {
    return KANBAN_COLUMNS.reduce(
      (acc, column) => {
        acc[column.id] = tasks.filter((task) => task.status === column.id);
        return acc;
      },
      {} as Record<TaskStatus, Task[]>
    );
  }, [tasks]);

  function openTask(task: Task) {
    setSelectedTaskId(task.id);
    setEditingDetails(false);
  }

  function handleStatusChange(task: Task, status: TaskStatus) {
    if (task.status === status) return;
    updateTaskStatus.mutate({ taskId: task.id, status });
  }

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    const targetStatus = event.over?.id;
    setActiveTask(null);

    if (!task || !isTaskStatus(targetStatus) || task.status === targetStatus) {
      return;
    }

    updateTaskStatus.mutate({ taskId: task.id, status: targetStatus });
  }

  async function handleCreateTask(values: {
    title: string;
    description?: string;
    assigneeId?: string | null;
  }) {
    await createTask.mutateAsync({
      ...values,
      createdById: currentUser?.id,
    });
    setCreateOpen(false);
  }

  async function handleEditTask(values: {
    title: string;
    description?: string;
    assigneeId?: string | null;
  }) {
    if (!selectedTask) return;
    await updateTask.mutateAsync({
      taskId: selectedTask.id,
      ...values,
      description: values.description ?? null,
    });
    setEditingDetails(false);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteTask.mutateAsync(deleteTarget.id);
    if (selectedTaskId === deleteTarget.id) {
      setSelectedTaskId(null);
      setEditingDetails(false);
    }
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Kanban Board</h2>
          <p className="text-sm text-gray-300">{project.name}</p>
        </div>
        <button
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          type="button"
          onClick={() => setCreateOpen(true)}
        >
          Add Task
        </button>
      </div>

      {message && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-md bg-white p-4 text-gray-700">
          Loading tasks...
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveTask(null)}
        >
          <div className="grid grid-cols-4 gap-4 overflow-x-auto">
            {KANBAN_COLUMNS.map((column) => (
              <TaskColumn
                key={column.id}
                status={column.id}
                title={column.title}
                tasks={tasksByStatus[column.id]}
                currentUser={currentUser}
                onCreateTask={() => setCreateOpen(true)}
                onOpenTask={openTask}
                onEditTask={(task) => {
                  setSelectedTaskId(task.id);
                  setEditingDetails(true);
                }}
                onDeleteTask={setDeleteTarget}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                currentUser={currentUser}
                onOpen={() => undefined}
                onEdit={() => undefined}
                onDelete={() => undefined}
                onStatusChange={() => undefined}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <CreateTaskModal
        open={createOpen}
        members={project.members || []}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateTask}
      />

      <TaskDetailsModal
        open={Boolean(selectedTask)}
        task={selectedTask}
        members={project.members || []}
        editing={editingDetails}
        onClose={() => {
          setSelectedTaskId(null);
          setEditingDetails(false);
        }}
        onEdit={() => setEditingDetails(true)}
        onCancelEdit={() => setEditingDetails(false)}
        onSubmitEdit={handleEditTask}
        onStatusChange={handleStatusChange}
        onAssigneeChange={(task, assigneeId) =>
          updateTask.mutate({ taskId: task.id, assigneeId })
        }
        onDelete={setDeleteTarget}
      />

      <DeleteConfirmation
        open={Boolean(deleteTarget)}
        title="Delete task"
        message={`Delete "${deleteTarget?.title ?? 'this task'}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
