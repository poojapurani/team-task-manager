const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  async register(userData) {
    const { name, email, password, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    return await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Member'
    });
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user, token };
  }

  async getUserById(id) {
    return await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
  }
}

module.exports = new AuthService();
