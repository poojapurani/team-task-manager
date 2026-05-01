const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// GET /api/users - Admin only, list all users
router.get('/', verifyToken, authorizeRoles('Admin'), userController.getAllUsers);

// GET /api/users/active - Get active members (for assignment dropdowns)
router.get('/active', verifyToken, userController.getActiveMembers);

module.exports = router;
