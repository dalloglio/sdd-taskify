export interface Project {
  id: string
  name: string
  createdAt: string
}

export interface ProjectWithMembers extends Project {
  members: { id: string; name: string }[]
}
