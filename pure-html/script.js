const colors = [
  "198db3",
  "028090",
  "81b2e9",
  "6279bd",
  "c686d0",
  "c77198",
  "f45b69",
  "f17b5a",
  "c45a18",
];

let jsonData = {};
let markers = {};
let map = null;
let selectedMarker = null;
let polyline = null;
const markerRadius = 4;
const markerWeight = 0;
const selectedMarkerRadius = 10;
const selectedMarkerWeight = 5;

const findPointByGPS = (lat, lng) => {
  let minDistance = 9;
  let minDistancePoint = null;

  for (const district of jsonData) {
    for (const school of district.schools) {
      for (const point of school.addresses) {
        if (!point.lat || !point.lng) {
          continue;
        }
        const distance = Math.abs(point.lat - lat) + Math.abs(point.lng - lng);
        if (distance < 0.00001) {
          console.log("found");
          console.log(distance);
          return point;
        } else if (distance < 0.0001 && distance < minDistance) {
          minDistance = distance;
          minDistancePoint = point;
        }
      }
    }
  }
  return minDistancePoint;
};

const createMap = (jsonPath, center, zoom) => {
  map = L.map("map");
  L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  }).addTo(map);

  map.setView(center, zoom);

  const myRenderer = L.canvas({ padding: 0.5 });
  const districtLayerGroups = [];
  const layerGroupsForControl = {};
  const schoolsLayerGroup = L.layerGroup().addTo(map);

  fetch(jsonPath).then((response) => {
    response.json().then((json) => {
      jsonData = json;
      let colorIndex = 0;
      json.forEach((district) => {
        let layerGroup = L.layerGroup().addTo(map);
        layerGroupsForControl[district.municipalityName] = layerGroup;
        districtLayerGroups.push(layerGroup);
        district.schools.forEach((school) => {
          const schoolMarker = L.circle(
            [school.position.lat, school.position.lng],
            {
              renderer: myRenderer,
              radius: 15,
              fill: true,
              fillColor: "#" + colors[colorIndex % colors.length],
              fillOpacity: 1,
              weight: 8,
              color: "#" + colors[colorIndex % colors.length],
            }
          )
            .bindPopup(school.name)
            .addTo(schoolsLayerGroup);

          markers[school.name] = schoolMarker;

          school.addresses.forEach((point) => {
            if (!point.lat || !point.lng) {
              return;
            }
            const marker = L.circle([point.lat, point.lng], {
              renderer: myRenderer,
              radius: 4,
              weight: 0,
              fill: true,
              fillColor: "#" + colors[colorIndex % colors.length],
              fillOpacity: 1,
              color: "#ffff00",
            }).bindPopup(point.address);
            marker.school = schoolMarker;
            layerGroup.addLayer(marker);
            markers[point.address] = marker;
          });
          colorIndex++;
        });
      });
      layerGroupsForControl["Školy"] = schoolsLayerGroup;
      L.control.layers(null, layerGroupsForControl).addTo(map);

      let added = true;
      const minZoomForAddressPoints = 15;
      zoomend = function () {
        console.log("zoomend: " + map.getZoom());
        if (map.getZoom() < minZoomForAddressPoints && added === true) {
          console.log("removing");
          districtLayerGroups.forEach((layerGroup) => {
            map.removeLayer(layerGroup);
          });
          added = false;
        }
        if (map.getZoom() >= minZoomForAddressPoints && added === false) {
          console.log("adding");
          districtLayerGroups.forEach((layerGroup) => {
            map.addLayer(layerGroup);
          });
          added = true;
        }
      };
      map.on("zoomend", zoomend);
      zoomend();
    });
  });
};

const loadMapyCzSuggest = () => {
  // naseptavac
  let inputEl = document.querySelector("#suggest input[type='text']");
  let suggest = new SMap.Suggest(inputEl, {
    provider: new SMap.SuggestProvider({}),
  });
  suggest.addListener("suggest", (suggestData) => {
    if (suggestData.data.longitude && suggestData.data.latitude) {
      const addressPoint = findPointByGPS(
        suggestData.data.latitude,
        suggestData.data.longitude
      );
      let marker = addressPoint ? markers[addressPoint.address] : null;

      // if not matched by GPS, try to match by name
      if (!marker) {
        const key = Object.keys(markers).find((k) =>
          k.startsWith(suggestData.phrase)
        );
        if (key) {
          marker = markers[key];
          console.log("found by name");
        }
      }

      if (marker) {
        centerLeafletMapOnMarker(marker);
      } else {
        showAlert(`Adresu '${suggestData.phrase}' jsme na mapě nenašli.`);
      }
    }
  });
};

const centerLeafletMapOnMarker = (marker) => {
  if (map === null) {
    return;
  }
  var latLngs = [marker.getLatLng(), marker.school.getLatLng()];
  var markerBounds = L.latLngBounds(latLngs);
  map.once("moveend", function () {
    selectMarker(marker);
    if (polyline) {
      polyline.remove();
    }
    polyline = L.polyline(latLngs, { color: "red", dashArray: "10, 10" }).addTo(
      map
    );
    marker.bringToFront();
    marker.school.bringToFront();
    marker.school.openPopup();
  });
  map.fitBounds(markerBounds, { padding: [150, 150] });
};

const selectMarker = (marker) => {
  if (selectedMarker) {
    selectedMarker.setRadius(markerRadius).setStyle({ weight: markerWeight });
  }
  selectedMarker = marker;
  selectedMarker
    .setRadius(selectedMarkerRadius)
    .setStyle({ weight: selectedMarkerWeight });
};

const showAlert = (message) => {
  const alertDiv = document.getElementById("alert");
  alertDiv.innerHTML = message;
  alertDiv.style.opacity = "1";
  alertDiv.style.display = "block";

  setTimeout(() => {
    alertDiv.style.opacity = "0";
  }, 5000);
};
