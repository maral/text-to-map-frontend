import './App.css';
import Header from "./Header";
import {Helmet} from "react-helmet";
import React, {useState, useEffect} from "react";

function App() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  function MapWrapper () {

    useEffect(() => {
      const script = document.getElementById("map-loader-script");

      script.onLoad = () => {
        window.Loader.async = true;
        window.Loader.load(
          null,
          null,
          setIsMapLoaded(true)
        );
      }
    })
    return (<div id="wrapper">{isMapLoaded ? <p>Loading...</p> : <ActualMap />}</div>)
    };

    function AddScript(scriptUrl) {
      useEffect(() => {
        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = false;
        script.type = "text/javascript"
        document.getElementById("map").appendChild(script);
      })
    }

    function ActualMap() {
      return (<div id="map" style={{width: "600px", height: "400px"}}>{AddScript("/mapscript.js")}</div>);
    };

  return (
    <div className="App">
    <Helmet>
  <script src=
"https://api.mapy.cz/loader.js"
  type="text/javascript" id="map-loader-script" />
  </Helmet>
      <Header />
      <MapWrapper />
    </div>
  );
}

export default App;

// ////////////////// POSTUP /////////////////////////////
// create header
// navbar
// footer

// vymenit faviconu
// upravit manifest
