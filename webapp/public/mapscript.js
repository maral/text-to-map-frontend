console.log("mapscript running");
var stred = SMap.Coords.fromWGS84(14.41, 50.08);
var mapa= new SMap(window.JAK.gel("map"), stred, 10);
mapa.addDefaultLayer(SMap.DEF_BASE).enable();
mapa.addDefaultControls();
