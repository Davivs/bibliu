const db = require("../models");

module.exports = (sequelize, Sequelize) => {
    const Author = sequelize.define("author", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        }
    });

    return Author;
};