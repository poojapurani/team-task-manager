const UserService = require('../services/UserService');

const getAllUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getActiveMembers = async (req, res) => {
  try {
    const members = await UserService.getActiveMembers();
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, getActiveMembers };
