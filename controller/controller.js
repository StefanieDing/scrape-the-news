//dependencies
var express = require('express');
var router = express.Router();
var path = require('path');

//require request and cheerio to scrape
var request = require('request');
var cheerio = require('cheerio');

//Require models
var Comment = require('../models/Comment.js');
var Article = require('../models/Article.js');

//index
router.get("/", function(req, res) {
    res.render("index");
});

// A GET request to scrape the CNN website
router.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request("http://www.theverge.com/tech", function(error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Now, we grab every article
        $('.c-hub-entry__title').each(function(i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children('a').text();
            result.link = $(this).children('a').attr('href');

            //grab body of article from scraped link
            request(result.link, function(error, response, html) {
                $('.c-entry-content').each(function(i, element) {
                    result.body = $(this).children('p').text();
                });
            });
            // Using our Article model, create a new entry
            // This effectively passes the result object to the entry (and the title and link)
            var entry = new Article(result);
                    console.log(entry);
                    // Now, save that entry to the db
                    entry.save(function(err, doc) {
                        // Log any errors
                        if (err) {
                            console.log(err);
                        }
                        // Or log the doc
                        else {
                            console.log(doc);
                        }
                    });

        });
    });
    // after scrape, redirects to index
    res.redirect('/');
});

// This will get the articles we scraped from the mongoDB
router.get("/articles", function(req, res) {
    Article.find({}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

//test clear all
router.get('/clearAll', function(req, res) {
    Article.remove({}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log('removed all articles');
        }

    });
    res.redirect('/articles');
});

// Create a new comment
router.post("/comment/:id", function(req, res) {
    var newComment = new Comment(req.body);

    newComment.save(function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
                //execute everything
                .exec(function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send(doc);
                    }
                });
        }
    });
});

module.exports = router;
