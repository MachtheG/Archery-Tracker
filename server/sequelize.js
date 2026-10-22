const { Sequelize } = require('sequelize');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction || process.env.DATABASE_URL || process.env.POSTGRES_HOST) {
  if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: isProduction ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    });
  } else {
    sequelize = new Sequelize({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      logging: false,
      dialectOptions: isProduction ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    });
  }
} else {
  // Local dev fallback only — never used in production.
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false,
  });
}

module.exports = sequelize;
