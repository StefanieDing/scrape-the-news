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
router.get("/", function(req, res){
  res.render("index");
});

var url = "http://www.cnn.com/"
// A GET request to scrape the CNN website
router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request(url, function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h3").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("span").text();
      result.link = url + $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

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
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
router.get("/articles", function(req, res) {
  Article.find({}, function(err, doc){
    if(err){
      console.log(err);
    } else{
      res.json(doc);
    }
  });
});


// Create a new comment
router.post("/comment/:id", function(req, res) {
  var newComment = new Comment(req.body);

  newComment.save(function(err, doc){
    if(err){
      console.log(err);
    } else{
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      //execute everything
      .exec(function(err, doc) {
        if(err) {
          console.log(err);
        } else{
          res.send(doc);
        }
      });
    }
  });
});

module.exports = router;