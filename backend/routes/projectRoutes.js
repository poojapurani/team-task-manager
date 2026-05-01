const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, projectController.getAllProjects);
router.get('/:id', verifyToken, projectController.getProjectById);
router.post('/', verifyToken, authorizeRoles('Admin'), projectController.createProject);
router.put('/:id', verifyToken, authorizeRoles('Admin'), projectController.updateProject);
router.delete('/:id', verifyToken, authorizeRoles('Admin'), projectController.deleteProject);

// Member management
router.get('/:id/members', verifyToken, projectController.getProjectMembers);
router.post('/:id/members', verifyToken, authorizeRoles('Admin'), projectController.addMember);
router.delete('/:id/members/:userId', verifyToken, authorizeRoles('Admin'), projectController.removeMember);

module.exports = router;
