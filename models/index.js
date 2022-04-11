const {Sequelize, DataTypes, Model} = require('sequelize')
const {sequelize} = require('../db')


class User extends Model {}
class Item extends Model {}
class School extends Model {}
class Favorite extends Model {}

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
    sid: DataTypes.STRING,
    fafsa: DataTypes.STRING,
    name: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    women: DataTypes.FLOAT,
}, {
    sequelize,
    timestamps: false,
});

Favorite.init({
    UserId:  DataTypes.UUID,
    SchoolId: DataTypes.UUID,
    
}, {
    sequelize,
    timestamps: false,
});


School.belongsToMany(User, {through: Favorite});
User.belongsToMany(School, {through: Favorite});

module.exports = {User, Item, School, Favorite};