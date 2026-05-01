const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

class ActivityService {
  async getRecentActivity(limit = 20) {
    return await ActivityLog.findAll({
      include: [{ model: User, as: 'performer', attributes: ['id', 'name', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  async getActivityByEntity(entityType, entityId) {
    return await ActivityLog.findAll({
      where: { entityType, entityId },
      include: [{ model: User, as: 'performer', attributes: ['id', 'name', 'role'] }],
      order: [['createdAt', 'DESC']],
    });
  }
}

module.exports = new ActivityService();
