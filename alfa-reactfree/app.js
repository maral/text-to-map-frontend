/////////////////////////// POSTUP ////////////////////////////
// POST req: look up input in array (later, use naseptavac and db), find corresponding coordinates, plot them on the map
// style it


///////////////// VYHLEDAT ADRESU, ZOBRAZIT SKOLU //////////////////
// vytvorit EJS form komponentu pro tuto funkci, integrovat do ni komponentu s form a mapou, to integrovat do cilove stranky (zatim home, pozdeji separatni stranka s celou feature)
// form method post
// input do naseptavace
// click the submit button -> make a post request to home
// funkce: projet JS object (pozdeji mongoDB request) a vratit JS object s udaji pro dva markery - skolu a prislusnou adresu
// renderovat output funkce vyse na mape


//rozdelit deti podle spadovych obvodu

const express = require("express");
const path = require('path');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
let ejs = require("ejs");
const p10catchment = require("./p10data.json");

const app = express();
//set up EJS templates
app.set('view engine', 'ejs');

// implement bootstrap styles
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));

// implement our css stylesheet
app.use('/', express.static(path.join(__dirname, '/public/css')));

// render homepage upon calling the home route
app.get("/", (req, res) => {
  //deconstruct the catchment area into an array with individual homes (adress points)
  // const [homes] = p10catchment;
  res.render("home", {
    getCatchmentArea: p10catchment
  });
});

// submit form from the home page
app.post("/", (req, res) => {
  console.log(req);
  res.redirect("/");
});

// start server
app.listen(3000, () => {
  console.log("Listening on port " + 3000)
})
