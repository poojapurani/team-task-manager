const ProjectService = require('../services/ProjectService');

const createProject = async (req, res) => {
  try {
    const project = await ProjectService.createProject(req.body, req.user.id);
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await ProjectService.getAllProjects();
    } else {
      // Members only see projects they belong to
      projects = await ProjectService.getProjectsByUser(req.user.id);
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await ProjectService.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await ProjectService.updateProject(req.params.id, req.body, req.user.id);
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const result = await ProjectService.deleteProject(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const addMember = async (req, res) => {
  try {
    const result = await ProjectService.addMember(req.params.id, req.body.userId);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const result = await ProjectService.removeMember(req.params.id, req.params.userId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getProjectMembers = async (req, res) => {
  try {
    const members = await ProjectService.getProjectMembers(req.params.id);
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createProject, getAllProjects, getProjectById, updateProject, deleteProject, addMember, removeMember, getProjectMembers };
