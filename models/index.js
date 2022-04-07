const {Sequelize, DataTypes, Model} = require('sequelize')
const {sequelize} = require('../db')


class User extends Model {}

class Item extends Model {}
class School extends Model {}


User.init({
    name: DataTypes.STRING,
    password: DataTypes.STRING,
}, {
    sequelize,
    timestamps: false,
});


Item.init({
    name: DataTypes.STRING
}, {
    sequelize,
    timestamps: false,
});

School.init({
    name: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    women: DataTypes.FLOAT,
}, {
    sequelize,
    timestamps: false,
});

module.exports = {User, Item, School};