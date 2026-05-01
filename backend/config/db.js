const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Railway provides MYSQL_URL or DATABASE_URL for MySQL addon
if (process.env.MYSQL_URL || process.env.DATABASE_URL) {
  const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
  sequelize = new Sequelize(dbUrl, {
    dialect: 'mysql',
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mysql',
      logging: false,
    }
  );
}

sequelize
  .authenticate()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Unable to connect to the database:', err));

module.exports = sequelize;
