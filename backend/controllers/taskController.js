const TaskService = require('../services/TaskService');

const createTask = async (req, res) => {
  try {
    const task = await TaskService.createTask(req.body, req.user.id);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const filters = {};
    if (req.query.projectId) filters.projectId = req.query.projectId;
    if (req.query.status) filters.status = req.query.status;

    let tasks;
    if (req.user.role === 'Admin') {
      if (req.query.assigneeId) filters.assigneeId = req.query.assigneeId;
      tasks = await TaskService.getAllTasks(filters);
    } else {
      // Members only see their own tasks
      tasks = await TaskService.getTasksByUser(req.user.id, filters);
    }
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await TaskService.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await TaskService.updateTask(req.params.id, req.body, req.user.id);
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const result = await TaskService.deleteTask(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const stats = await TaskService.getTaskStats(req.user.id, req.user.role);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask, getTaskStats };
