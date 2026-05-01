const express = require('express');
const router = express.Router();
const ActivityService = require('../services/ActivityService');
const { verifyToken } = require('../middlewares/authMiddleware');

// GET /api/activity/recent - Get recent activity
router.get('/recent', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activity = await ActivityService.getRecentActivity(limit);
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/activity?entityType=Task&entityId=5 - Get activity for specific entity
router.get('/', verifyToken, async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    if (!entityType || !entityId) {
      return res.status(400).json({ message: 'entityType and entityId are required' });
    }
    const activity = await ActivityService.getActivityByEntity(entityType, parseInt(entityId));
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
