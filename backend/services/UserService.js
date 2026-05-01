const User = require('../models/User');

class UserService {
  async getAllUsers() {
    return await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status'],
      order: [['name', 'ASC']],
    });
  }

  async getActiveMembers() {
    return await User.findAll({
      where: { status: 'Active' },
      attributes: ['id', 'name', 'email', 'role'],
      order: [['name', 'ASC']],
    });
  }
}

module.exports = new UserService();
