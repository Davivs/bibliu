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

    const Book = sequelize.define("book", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        title: {
            type: Sequelize.TEXT
        },
        publisher: {
            type: Sequelize.STRING
        },
        pubDate : {
            type: Sequelize.STRING
        },
        language: {
            type: Sequelize.STRING
        },
        license: {
            type: Sequelize.STRING
        },
        subjects: {
            type: Sequelize.TEXT
        }
    });

    Author.belongsToMany(Book, {through : 'AuthorBook'});
    Book.belongsToMany(Author, {through : 'AuthorBook'});

    return Book;
};