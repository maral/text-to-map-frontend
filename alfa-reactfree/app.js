const express = require("express");
const path = require('path');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );

const app = express();

// implement bootstrap styles
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));

// implement our css stylesheet
app.use('/', express.static(path.join(__dirname, '/css')));

// render homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'))
});

// start server
app.listen(3000, () => {
  console.log("Listening on port " + 3000)
})
