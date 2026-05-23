export type TaskStatus = 'to_do' | 'in_progress' | 'in_review' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  status: TaskStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assigneeId?: string | null;
  status?: TaskStatus;
  createdById?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  status?: TaskStatus;
}
