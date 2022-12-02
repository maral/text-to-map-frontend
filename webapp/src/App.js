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
    return (<div id="wrapper">{isMapLoaded ? <p>Loading...</p> : <p>Wrapper loaded</p>}</div>)
    };

    function ActualMap() {
      const mapa = null;
      useEffect(() => {
        var stred = SMap.Coords.fromWGS84(14.41, 50.08);
        var defaultMap = new SMap(JAK.gel("map"), stred, 10);
        mapa.addDefaultLayer(SMap.DEF_BASE).enable();
        mapa.addDefaultControls();
      })


      return (<div id="map"/>);
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
