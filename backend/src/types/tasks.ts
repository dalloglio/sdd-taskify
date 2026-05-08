export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'

export interface Task {
  id: string
  title: string
  description?: string
  assigneeId?: string
  status: TaskStatus
  projectId: string
}
