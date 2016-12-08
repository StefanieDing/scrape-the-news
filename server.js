//dependencies
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var logger = require('morgan');
var request = require('request');
var cheerio = require('cheerio');

//initialize Express app
var express = require('express');
var app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static(process.cwd() + '/public'));

var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//connecting to MongoDB
mongoose.connect('mongodb://localhost/scraped_news');
var db = mongoose.connection;

//show mongoose errors
db.on('error', function(error) {
  console.log('Mongoose Error: ', error);
});

//once logged into the db through mongoose, log success message
db.once('open', function() {
  console.log("Mongoose connected.");
});

var routes = require('./controller/controller.js');
app.use('/', routes);

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Listening on PORT ' + port);
});
