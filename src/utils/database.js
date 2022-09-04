const { Sequelize, DataTypes } = require("sequelize");

const POSTGRES_URI = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

const database = new Sequelize(POSTGRES_URI, {
  logging: false,
});

exports.database = database;
