
var path = require('path');
var express = require('express');

var expressHB = require('express-handlebars');

var bodyParse = require('body-parser');

var fs = require('fs');

var updateJsonFile = require('update-json-file');
var filePath = "./scoreBoard.json";


var app = express();
var port = process.env.PORT || 3000;

//setup handlebars
app.engine('handlebars', expressHB({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//setup the Date object for timeouts
var date = new Date();



//====================
//Server Functionality
//====================



  app.get("/registration", function (req, res) {
    res.status(200).render('registration');
  });

  app.get("/login", function (req, res) {
    res.status(200).render('login');
  });

  app.get("/account", function (req, res) {
    res.status(200).render('account');
  });

  app.get("/battle/display", function (req, res) {
    res.status(200).render('battle_display');
  });

  app.get("/battle/create", function (req, res) {
    res.status(200).render('battle_create');
  });

  //serve the home page to the client
  app.get('/', function(req, res){
    console.log("==Home Page Requested");
    res.status(200).render('homePage');
  });





app.use(express.static('public'));


app.get('*', function (req, res) {
  //console.log("==URL NOT FOUND: ", req.url);
  console.log("==Sending 404:", req.url);
  res.status(404).render('404page');
});

app.listen(port, function () {
  console.log("== Server is listening on port", port);
});