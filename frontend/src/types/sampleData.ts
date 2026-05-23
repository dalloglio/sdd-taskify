export interface SampleProjectSummary {
  id: string;
  name: string;
  membersCount: number;
  tasksCount: number;
  commentsCount: number;
}

export interface SampleDataSummary {
  usersCount: number;
  projectsCount: number;
  tasksCount: number;
  commentsCount: number;
  sampleProjectNames: string[];
  projects: SampleProjectSummary[];
}
