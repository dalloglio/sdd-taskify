export type ID = string;

export interface User {
  id: ID;
  name: string;
  role?: 'product_manager' | 'engineer' | string;
  email?: string;
  avatarUrl?: string;
}

export interface Project {
  id: ID;
  name: string;
  description?: string;
  members: User[];
  createdAt: string;
  isSample?: boolean;
  tasksCount?: number;
  commentsCount?: number;
}

export type TaskStatus = 'to_do' | 'in_progress' | 'in_review' | 'done';

export interface Task {
  id: ID;
  title: string;
  description?: string;
  assignee?: User | null;
  createdBy?: User | null;
  commentCount?: number;
  comments?: Comment[];
  status: TaskStatus;
  projectId: ID;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: ID;
  author: User;
  text: string;
  taskId: ID;
  projectId?: ID;
  createdAt: string;
  updatedAt?: string;
}
