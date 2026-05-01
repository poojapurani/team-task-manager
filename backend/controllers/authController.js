const AuthService = require('../services/AuthService');

const register = async (req, res) => {
  try {
    const user = await AuthService.register(req.body);
    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await AuthService.login(email, password);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

const getProfile = async (req, res) => {
  try {
    const user = await AuthService.getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

module.exports = { register, login, logout, getProfile };
