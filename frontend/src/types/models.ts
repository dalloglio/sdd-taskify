export type ID = string;

export interface User {
  id: ID;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface Project {
  id: ID;
  name: string;
  description?: string;
  members: User[];
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface Task {
  id: ID;
  title: string;
  description?: string;
  assignee?: User | null;
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
  createdAt: string;
}
