const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  entityType: {
    type: DataTypes.ENUM('Task', 'Project'),
    allowNull: false,
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  performedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = ActivityLog;
