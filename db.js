const { Sequelize, DataTypes, Model } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'postgres',
    protocol: 'postgres',
    storage: path.join(__dirname, 'data.db')
})

module.exports = {sequelize}