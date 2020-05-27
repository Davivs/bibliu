var express = require('express');
var router = express.Router();
const fs = require('fs');
const xml2js = require('xml2js');
const inspect = require('eyes').inspector({maxLength: false});
const db = require("../models");
db.sequelize.sync();

async function insertBook(book)
{
    db.books.create(book, {
        include : [ db.authors ],
    }).then(data => {
        return data.dataValues; // Object from Sequelize
    }).catch(err => {
        inspect(err);
        return err;
    });
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

async function readFile(filePath)
{
    const parser = new xml2js.Parser();
    fs.readFile(filePath, function(err, data)
    {
        if (err) // If filePath does not exist, could do a proper folder parser, not the point of this project.
        {
            inspect(err);
            return;
        }

        parser.parseString(data, async function (err, result) {
            let subjects = [];
            let authors = [];
            if (result)
            {
                const id = result["rdf:RDF"]["pgterms:ebook"][0]["$"]["rdf:about"].substr(7); // Extract bookId from about
                const title = result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:title"][0]; // Parse title from file
                const publisher = result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:publisher"][0]; // Parse publisher from file
                const pubDate = result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:issued"][0]["_"]; // Parse published date from file
                const language = result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:language"][0]["rdf:Description"][0]["rdf:value"][0]["_"]; // Parse language from file
                const license = result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:rights"][0]; // Parse License from file


                if (result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:subject"]) // If book doesn't have subjects
                    result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:subject"].forEach(element => subjects.push(element["rdf:Description"][0]["rdf:value"])); // Create an array of subjects, could be used to create another Sequelize association if we need to query
                if (result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:creator"]) // If book doesn't have authors
                    result["rdf:RDF"]["pgterms:ebook"][0]["dcterms:creator"].forEach(element => authors.push({name: element["pgterms:agent"][0]["pgterms:name"][0].replace(/,/g, "")})); // Create an array of Authors so we can query them.

                newBook = new bookInformation(id, title, authors, publisher, pubDate, language, JSON.stringify(subjects), license);

                const bookInsert = await insertBook(newBook); // We could use this await to have proper answer through API.
            }
            else
            {
                inspect(err);
                return err;
            }
        });
    });
}


/* GET books */
router.get('/', async function(req, res, next) {

    const book = await readFile("./rdf-files/cache/epub/1/pg1.rdf");
    res.send("Done");

    /*
    for (let i = 1; i < 60000; i++)
    {
        await readFile("./rdf-files/cache/epub/"+i+"/pg"+i+".rdf");
    } */
});

module.exports = router;
