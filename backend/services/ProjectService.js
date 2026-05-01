const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const ProjectMember = require('../models/ProjectMember');
const ActivityLog = require('../models/ActivityLog');
const sequelize = require('../config/db');

class ProjectService {
  async createProject(data, adminId) {
    const project = await Project.create({ ...data, managerId: adminId });

    // Auto-add the creator (Admin) as a project member
    await ProjectMember.create({ projectId: project.id, userId: adminId });

    // Log activity
    await ActivityLog.create({
      entityType: 'Project',
      entityId: project.id,
      action: 'Project created',
      details: `Project "${data.name}" was created`,
      performedBy: adminId,
    });

    return project;
  }

  async getAllProjects() {
    const projects = await Project.findAll({
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } },
        { model: Task, as: 'tasks', attributes: ['id', 'status'] },
      ],
    });

    // Compute progress for each project
    return projects.map(p => {
      const proj = p.toJSON();
      const totalTasks = proj.tasks ? proj.tasks.length : 0;
      const completedTasks = proj.tasks ? proj.tasks.filter(t => t.status === 'Completed').length : 0;
      proj.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      proj.totalTasks = totalTasks;
      proj.completedTasks = completedTasks;
      return proj;
    });
  }

  async getProjectsByUser(userId) {
    // Get project IDs where user is a member
    const memberships = await ProjectMember.findAll({
      where: { userId },
      attributes: ['projectId'],
    });
    const projectIds = memberships.map(m => m.projectId);

    if (projectIds.length === 0) return [];

    const projects = await Project.findAll({
      where: { id: projectIds },
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } },
        { model: Task, as: 'tasks', attributes: ['id', 'status'] },
      ],
    });

    return projects.map(p => {
      const proj = p.toJSON();
      const totalTasks = proj.tasks ? proj.tasks.length : 0;
      const completedTasks = proj.tasks ? proj.tasks.filter(t => t.status === 'Completed').length : 0;
      proj.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      proj.totalTasks = totalTasks;
      proj.completedTasks = completedTasks;
      return proj;
    });
  }

  async getProjectById(id) {
    const project = await Project.findByPk(id, {
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } },
        { model: Task, as: 'tasks', include: [{ model: User, as: 'assignee', attributes: ['id', 'name'] }] },
      ],
    });

    if (!project) return null;

    const proj = project.toJSON();
    const totalTasks = proj.tasks ? proj.tasks.length : 0;
    const completedTasks = proj.tasks ? proj.tasks.filter(t => t.status === 'Completed').length : 0;
    proj.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    proj.totalTasks = totalTasks;
    proj.completedTasks = completedTasks;
    return proj;
  }

  async updateProject(id, data, userId) {
    const project = await Project.findByPk(id);
    if (!project) throw new Error('Project not found');

    const oldStatus = project.status;
    const updated = await project.update(data);

    // Log status change
    if (data.status && data.status !== oldStatus) {
      await ActivityLog.create({
        entityType: 'Project',
        entityId: id,
        action: 'Status changed',
        details: `Status changed from "${oldStatus}" to "${data.status}"`,
        performedBy: userId,
      });
    }

    return updated;
  }

  async deleteProject(id) {
    const project = await Project.findByPk(id);
    if (!project) throw new Error('Project not found');
    // Remove all members first
    await ProjectMember.destroy({ where: { projectId: id } });
    await project.destroy();
    return { message: 'Project deleted' };
  }

  async addMember(projectId, userId) {
    const project = await Project.findByPk(projectId);
    if (!project) throw new Error('Project not found');

    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Check if already a member
    const existing = await ProjectMember.findOne({ where: { projectId, userId } });
    if (existing) throw new Error('User is already a member of this project');

    await ProjectMember.create({ projectId, userId });

    return { message: `${user.name} added to project` };
  }

  async removeMember(projectId, userId) {
    const membership = await ProjectMember.findOne({ where: { projectId, userId } });
    if (!membership) throw new Error('User is not a member of this project');

    await membership.destroy();
    return { message: 'Member removed from project' };
  }

  async getProjectMembers(projectId) {
    const members = await ProjectMember.findAll({
      where: { projectId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
    });
    return members.map(m => m.user);
  }
}

module.exports = new ProjectService();
