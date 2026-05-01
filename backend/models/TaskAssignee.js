const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TaskAssignee = sequelize.define('TaskAssignee', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['taskId', 'userId'],
    },
  ],
});

module.exports = TaskAssignee;
