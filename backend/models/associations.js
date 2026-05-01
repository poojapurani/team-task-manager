const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const ProjectMember = require('./ProjectMember');
const TaskAssignee = require('./TaskAssignee');
const ActivityLog = require('./ActivityLog');

const applyAssociations = () => {
  // Project <-> User (Creator/Admin who created)
  User.hasMany(Project, { foreignKey: 'managerId', as: 'createdProjects' });
  Project.belongsTo(User, { foreignKey: 'managerId', as: 'createdBy' });

  // Project <-> User (Many-to-Many via ProjectMember)
  Project.belongsToMany(User, { through: ProjectMember, as: 'members', foreignKey: 'projectId' });
  User.belongsToMany(Project, { through: ProjectMember, as: 'projects', foreignKey: 'userId' });

  // ProjectMember explicit associations
  ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  ProjectMember.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
  User.hasMany(ProjectMember, { foreignKey: 'userId', as: 'memberships' });
  Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'projectMembers' });

  // Project <-> Task
  Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
  Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

  // Task <-> User (Many-to-Many via TaskAssignee)
  Task.belongsToMany(User, { through: TaskAssignee, as: 'assignees', foreignKey: 'taskId' });
  User.belongsToMany(Task, { through: TaskAssignee, as: 'assignedTasks', foreignKey: 'userId' });

  // TaskAssignee explicit associations
  TaskAssignee.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  TaskAssignee.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
  User.hasMany(TaskAssignee, { foreignKey: 'userId', as: 'taskAssignments' });
  Task.hasMany(TaskAssignee, { foreignKey: 'taskId', as: 'taskAssignees' });

  // ActivityLog <-> User
  User.hasMany(ActivityLog, { foreignKey: 'performedBy', as: 'activities' });
  ActivityLog.belongsTo(User, { foreignKey: 'performedBy', as: 'performer' });
};

module.exports = applyAssociations;
