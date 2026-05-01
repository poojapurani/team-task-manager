const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const TaskAssignee = require('../models/TaskAssignee');
const ProjectMember = require('../models/ProjectMember');
const ActivityLog = require('../models/ActivityLog');
const { Op } = require('sequelize');

class TaskService {
  async createTask(data, createdBy) {
    const { assigneeIds, ...taskData } = data;

    const task = await Task.create(taskData);

    // Assign to multiple members
    if (assigneeIds && Array.isArray(assigneeIds) && assigneeIds.length > 0) {
      const assignments = assigneeIds.map(userId => ({ taskId: task.id, userId: parseInt(userId) }));
      await TaskAssignee.bulkCreate(assignments);
    }

    // Log activity
    await ActivityLog.create({
      entityType: 'Task',
      entityId: task.id,
      action: 'Task created',
      details: `Task "${taskData.title}" was created`,
      performedBy: createdBy,
    });

    // Return task with assignees
    return await this.getTaskById(task.id);
  }

  async getAllTasks(filters = {}) {
    return await Task.findAll({
      where: filters,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email'], through: { attributes: [] } },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async getTasksByUser(userId, filters = {}) {
    // Get tasks assigned to this user
    const taskAssignments = await TaskAssignee.findAll({
      where: { userId },
      attributes: ['taskId'],
    });
    const assignedTaskIds = taskAssignments.map(ta => ta.taskId);

    // Also get projects the user is a member of
    const memberships = await ProjectMember.findAll({
      where: { userId },
      attributes: ['projectId'],
    });
    const projectIds = memberships.map(m => m.projectId);

    // Show tasks assigned to user OR belonging to their projects
    const where = {
      [Op.or]: [
        ...(assignedTaskIds.length > 0 ? [{ id: { [Op.in]: assignedTaskIds } }] : []),
        ...(projectIds.length > 0 ? [{ projectId: { [Op.in]: projectIds } }] : []),
      ],
      ...filters,
    };

    // If no assignments and no projects, return empty
    if (assignedTaskIds.length === 0 && projectIds.length === 0) {
      return [];
    }

    return await Task.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email'], through: { attributes: [] } },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async getTaskById(id) {
    return await Task.findByPk(id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email'], through: { attributes: [] } },
      ],
    });
  }

  async updateTask(id, data, updatedBy) {
    const task = await Task.findByPk(id);
    if (!task) throw new Error('Task not found');

    const { assigneeIds, ...taskData } = data;
    const oldStatus = task.status;

    // Update task fields
    if (Object.keys(taskData).length > 0) {
      await task.update(taskData);
    }

    // Update assignees if provided
    if (assigneeIds && Array.isArray(assigneeIds)) {
      // Remove old assignees
      await TaskAssignee.destroy({ where: { taskId: id } });
      // Add new assignees
      if (assigneeIds.length > 0) {
        const assignments = assigneeIds.map(userId => ({ taskId: id, userId: parseInt(userId) }));
        await TaskAssignee.bulkCreate(assignments);
      }
    }

    // Log status change
    if (taskData.status && taskData.status !== oldStatus) {
      await ActivityLog.create({
        entityType: 'Task',
        entityId: id,
        action: 'Status changed',
        details: `Status changed from "${oldStatus}" to "${taskData.status}"`,
        performedBy: updatedBy,
      });
    }

    return await this.getTaskById(id);
  }

  async deleteTask(id) {
    const task = await Task.findByPk(id);
    if (!task) throw new Error('Task not found');
    await TaskAssignee.destroy({ where: { taskId: id } });
    await task.destroy();
    return { message: 'Task deleted' };
  }

  async getTaskStats(userId, role) {
    let where = {};

    if (role === 'Member') {
      const taskAssignments = await TaskAssignee.findAll({
        where: { userId },
        attributes: ['taskId'],
      });
      const assignedTaskIds = taskAssignments.map(ta => ta.taskId);

      const memberships = await ProjectMember.findAll({
        where: { userId },
        attributes: ['projectId'],
      });
      const projectIds = memberships.map(m => m.projectId);

      if (assignedTaskIds.length === 0 && projectIds.length === 0) {
        return { total: 0, statusBreakdown: [], overdue: 0 };
      }

      where = {
        [Op.or]: [
          ...(assignedTaskIds.length > 0 ? [{ id: { [Op.in]: assignedTaskIds } }] : []),
          ...(projectIds.length > 0 ? [{ projectId: { [Op.in]: projectIds } }] : []),
        ],
      };
    }

    const total = await Task.count({ where });

    const statusBreakdown = await Task.findAll({
      attributes: ['status', [Task.sequelize.fn('COUNT', Task.sequelize.col('Task.id')), 'count']],
      where,
      group: ['status'],
    });

    const overdue = await Task.count({
      where: {
        ...where,
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'Completed' },
      },
    });

    return { total, statusBreakdown, overdue };
  }
}

module.exports = new TaskService();
