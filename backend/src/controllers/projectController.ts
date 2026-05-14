import { Request, Response } from 'express';
import * as projectService from '../services/projectService';
import { fail, ok } from '../utils/response';

function mapProject(p: any) {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    createdAt:
      p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    members: (p.members || []).map((m: any) => ({
      id: m.user.id,
      name: m.user.name,
      avatarUrl: m.user.avatarUrl,
    })),
  };
}

export async function createProject(req: Request, res: Response) {
  try {
    const { name, description, memberIds } = req.body;
    const project = await projectService.createProject({
      name,
      description,
      memberIds,
    });
    return ok(res, mapProject({ ...project, members: [] }));
  } catch (err: any) {
    return fail(res, err.message || 'Failed to create project');
  }
}

export async function listProjects(_req: Request, res: Response) {
  try {
    const projects = await projectService.getAllProjects();
    return ok(res, projects.map(mapProject));
  } catch (err: any) {
    return fail(res, err.message || 'Failed to list projects');
  }
}

export async function getProject(req: Request, res: Response) {
  try {
    const { projectId } = req.params as { projectId: string };
    const project = await projectService.getProject(projectId);
    if (!project) return fail(res, 'Project not found', 404);
    return ok(res, mapProject(project));
  } catch (err: any) {
    return fail(res, err.message || 'Failed to get project');
  }
}

export async function addMember(req: Request, res: Response) {
  try {
    const { projectId } = req.params as { projectId: string };
    const { userId } = req.body as { userId: string };
    const member = await projectService.addProjectMember(projectId, userId);
    return ok(res, { projectId: member.projectId, userId: member.userId });
  } catch (err: any) {
    return fail(res, err.message || 'Failed to add project member');
  }
}

export default { createProject, listProjects, getProject, addMember };
