/////////////////////////// POSTUP ////////////////////////////
// data sources: adresni body,
// style it

////////// ZADEJ MESTO, NAJDI SPADOVE OBVODY
// :parametr v URL
// pokud existuje v db takove mesto, proceed
// seber vsechny adresni body daneho mesta
// ukaz je na mape
// clustery podle skol pro rychlejsi load?
// umozni embed <embed src="http://www.nasemapka.cz:mesto" style="width:500px; height: 300px;">

///////////// OAUTH FEATURES (future) /////////////////

/////////////// FEATURE: nahrat excel s detmi -> dostat zpatky excel + spadove skoly u kazdeho radku
// upload excel .... process(parse into JSON?)
// for each line, find street in db, return school
// add to the object
// push object into array with objects
// generate excel for immediate download / send by email

///////// GENEROVAT PODKLADY
// select data from the city
// iterate through, remove duplicates (keep only the first instance, skip the others), link school
// recognize even or odd or all
// take lowest and highest numbers from both even and odd
// spit out an array
// plot the array on a txt, pdf - each array object in one line

const express = require("express");
const path = require('path');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
let ejs = require("ejs");
const mongoose = require("mongoose");
//sample data here
const p10catchment = require("./p10data.json");
//end of sample data

const app = express();
//set up EJS templates
app.set('view engine', 'ejs');

// implement bootstrap styles
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));

// implement our css stylesheet
app.use('/', express.static(path.join(__dirname, '/public/css')));

// use internal express body parser, rather than a separate package
app.use(express.urlencoded());

// render homepage upon calling the home route, make JSON data accessible to the home EJS template
app.get("/", (req, res) => {
  res.render("home", {
    getCatchmentArea: p10catchment
  });
});

app.get("/najdiskolu", (req, res) => {
  res.render("findschool", {
    getCatchmentArea: p10catchment
  });
// priprava na nacteni naseptavace
  window.onload = console.log("loaded");
});

app.post("/najdiskolu", (req, res) => {
  console.log(req.body);
  res.redirect("/najdiskolu");
});


// start server
app.listen(3000, () => {
  console.log("Listening on port " + 3000)
})
