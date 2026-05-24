-- Optimize Kanban board reads by project and column.
CREATE INDEX "tasks_projectId_status_idx" ON "tasks"("projectId", "status");
