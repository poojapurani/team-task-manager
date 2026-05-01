const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, taskController.getAllTasks);
router.get('/stats', verifyToken, taskController.getTaskStats);
router.get('/:id', verifyToken, taskController.getTaskById);
router.post('/', verifyToken, authorizeRoles('Admin'), taskController.createTask);
router.put('/:id', verifyToken, taskController.updateTask);
router.delete('/:id', verifyToken, authorizeRoles('Admin'), taskController.deleteTask);

module.exports = router;
