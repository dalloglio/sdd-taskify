export interface Comment {
  id: string;
  taskId: string;
  projectId?: string;
  author: {
    id: string;
    name: string;
    role?: string;
    avatarUrl?: string;
  };
  text: string;
  createdAt: string;
  updatedAt?: string;
}
