var express = require('express');
var router = express.Router();
const fs = require('fs');
const xml2js = require('xml2js');
const inspect = require('eyes').inspector({maxLength: false});
const db = require("../models");
db.sequelize.sync();

async function insertBook(book)
{
    let transaction;

    try {
        transaction = await db.sequelize.transaction();
        return await db.books.create(book, {include : [db.authors]}, transaction);
    } catch (err) {
        return (err);
    }
}

class bookInformation {
    constructor(id, title, authors, publisher, pubDate, language, subjects, license)
    {
        this.id = id;
        this.title = title;
        this.authors = authors;
        this.publisher = publisher;
        this.pubDate = pubDate;
        this.language = language;
        this.subjects = subjects;
        this.license = license;
    }
}

async function readFile(data)
{
    const parser = new xml2js.Parser();
    const promise = await new Promise((resolve, reject) => {
        parser.parseString(data, async function (err, result) {
            let subjects = [];
            let authors = [];
            //if (result) {
                const id = result["rdf:RDF"]["pgterms:ebook"][0]["$"]["rdf:about"].substr(7); // Extract bookId from about
                const title = result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:title"][0]; // Parse title from file
                const publisher = result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:publisher"][0]; // Parse publisher from file
                const pubDate = result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:issued"][0]["_"]; // Parse published date from file
                const language = result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:language"][0]["rdf:Description"][0]["rdf:value"][0]["_"]; // Parse language from file
                const license = result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:rights"][0]; // Parse License from file

                result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:subject"].forEach(element => subjects.push(element["rdf:Description"][0]["rdf:value"][0])); // Create an array of subjects, could be used to create another Sequelize association if we need to query
                if (result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:creator"]) // If book doesn't have authors
                    result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:creator"].forEach(element => authors.push({name: element["pgterms:agent"][0]["pgterms:name"][0].replace(/,/g, "")})); // Create an array of Authors so we can query them.

                newBook = new bookInformation(id, title, authors, publisher, pubDate, language, JSON.stringify(subjects), license);

                const bookInsert = await insertBook(newBook); // We could use this await to have proper answer through API.

                resolve(bookInsert);
            /*} else {
                inspect(err);
                resolve (err);
            }*/
        });
    });
    return promise;
}


/* GET books */
router.get('/:book', async function(req, res, next) {

    let bookId = req.params.book;

    try {
        const data = fs.readFileSync(`./rdf-files/cache/epub/${bookId}/pg${bookId}.rdf`, 'utf8');
        const book = await readFile(data);
        if (!book.errors)
            res.status(201).json(book.dataValues);
        else
            res.status(400).json(book.errors[0]);
    }
    catch (err) {
        res.status(400).json(err);
    }

    /*
    for (let i = 1; i < 60000; i++)
    {
        await readFile("./rdf-files/cache/epub/"+i+"/pg"+i+".rdf");
    } */
});

module.exports = router;
