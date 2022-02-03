const {DataTypes, Model} = require('sequelize');
const {sequelize} = require('../db')

class User extends Model {}

User.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    sequelize,
    timestamps: false
});

module.exports = {User};