const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  database: 'node-complete',
  username: 'root',
  password: '1385',
});

module.exports = sequelize;