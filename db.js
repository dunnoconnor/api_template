const { Sequelize, DataTypes, Model } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'postgres',
    protocol: 'postgres'
})

module.exports = {sequelize}