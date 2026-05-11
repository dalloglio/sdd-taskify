import { projects } from './fixtures/projects';
import { users } from './fixtures/users';

export function getSampleUsers() {
  return users;
}

export function getSampleProjects() {
  return projects;
}

export default {
  getSampleUsers,
  getSampleProjects,
};
