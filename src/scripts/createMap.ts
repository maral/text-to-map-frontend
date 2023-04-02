import { Municipality, School } from "@/types/data";
import L, {
  Polyline,
  Map as LeafletMap,
  LayerGroup,
  CircleMarker,
  LatLngBounds,
  PopupEvent,
  Popup,
} from "leaflet";

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

interface CircleMarkerWithSchool extends CircleMarker {
  school?: CircleMarkerWithSchool;
}

interface PopupWithMarker extends Popup {
  marker: CircleMarkerWithSchool;
}

const isPopupWithMarker = (popup: Popup): popup is PopupWithMarker => {
  return popup.hasOwnProperty("marker");
};

type MarkerMap = { [key: string]: CircleMarkerWithSchool };
type AddressLayerGroup = LayerGroup<CircleMarkerWithSchool>;
type SchoolLayerGroup = LayerGroup<CircleMarker>;

let _municipalities: Municipality[];
let markers: MarkerMap = {};
let map: LeafletMap;
let selectedMarker: CircleMarkerWithSchool;
let selectedMarkerOriginalColor: string;
let polyline: Polyline;
let lastListener: () => void;
const markerRadius = 4;
const markerWeight = 2;
const selectedMarkerRadius = 8;
const selectedMarkerWeight = 5;
const minZoomForAddressPoints = 16;
const emptyCallback = () => null;
const selectedMarkerColor = "#ffff00";

export const createMap = (
  element: HTMLElement,
  municipalities: Municipality[],
  center?: [number, number],
  zoom?: number,
  showControls: boolean = true,
  color?: string
): (() => void) => {
  if (!element || map) {
    return emptyCallback;
  }

  _municipalities = municipalities;

  map = prepareMap(element, showControls);

  const municipalityLayerGroups: AddressLayerGroup[] = [];
  const layerGroupsForControl: { [key: string]: SchoolLayerGroup } = {};
  const schoolsLayerGroup: SchoolLayerGroup = L.layerGroup().addTo(map);
  layerGroupsForControl["Školy"] = schoolsLayerGroup;
  const bounds = L.latLngBounds([]);

  let colorIndex = 0;
  municipalities.forEach((municipality) => {
    let layerGroup: AddressLayerGroup = L.layerGroup();
    layerGroupsForControl[municipality.municipalityName] = layerGroup;
    municipalityLayerGroups.push(layerGroup);
    municipality.schools.forEach((school) => {
      createSchoolMarkers(
        school,
        color ? color : `#${colors[colorIndex % colors.length]}`,
        schoolsLayerGroup,
        layerGroup,
        markers,
        bounds
      );
      colorIndex++;
    });
    municipalities;
  });

  map.on("popupopen", function (e: PopupEvent) {
    const popup = e.popup;
    if (isPopupWithMarker(popup)) {
      lastListener = () => {
        centerLeafletMapOnMarker(popup.marker);
      };
      const button =
        // @ts-ignore not ideal but unfortunately not other way to get the button
        e.popup._source._popup._contentNode.querySelector(".marker-button");
      button.addEventListener("click", lastListener);
    }
  });

  map.on("popupclose", function (e: PopupEvent) {
    const popup = e.popup;
    if (isPopupWithMarker(popup) && lastListener) {
      const button =
        // @ts-ignore
        e.popup._source._popup._contentNode.querySelector(".marker-button");
      button.removeEventListener("click", lastListener);
    }
  });

  if (center) {
    map.setView(center, zoom ?? 15);
  } else {
    map.fitBounds(bounds);
    if (zoom) {
      map.setZoom(zoom);
    }
  }

  if (municipalities.length > 1 && showControls) {
    L.control.layers(undefined, layerGroupsForControl).addTo(map);
  } else if (municipalities.length === 1) {
    map.addLayer(municipalityLayerGroups[0]);
  }

  const zoomEndHandler = createZoomEndHandler(map, municipalityLayerGroups);
  map.on("zoomend", zoomEndHandler);
  zoomEndHandler();
  return () => {
    map.remove();
  };
};

const prepareMap = (
  element: HTMLElement,
  showControls: boolean
): LeafletMap => {
  const map = L.map(element, {
    renderer: L.canvas({ padding: 0.5 }),
    zoomControl: showControls,
  });
  L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
};

const createSchoolMarkers = (
  school: School,
  color: string,
  schoolLayerGroup: SchoolLayerGroup,
  addressLayerGroup: AddressLayerGroup,
  markers: MarkerMap,
  bounds: LatLngBounds
): void => {
  const schoolMarker = L.circle([school.position.lat, school.position.lng], {
    radius: 15,
    fill: true,
    fillColor: color,
    fillOpacity: 1,
    weight: 8,
    color,
  })
    .bindPopup(school.name)
    .addTo(schoolLayerGroup);

  markers[school.name] = schoolMarker;
  bounds.extend(schoolMarker.getLatLng());

  school.addresses.forEach((point) => {
    if (!point.lat || !point.lng) {
      return;
    }

    const marker: CircleMarkerWithSchool = L.circle([point.lat, point.lng], {
      radius: markerRadius,
      weight: markerWeight,
      fill: true,
      fillColor: color,
      fillOpacity: 1,
      color,
    });
    const popup: PopupWithMarker = Object.assign(
      L.popup().setContent(`
      <div>
        ${point.address}
        <div class="text-center mt-2"><button class="btn btn-success btn-sm marker-button">
          Zobrazit spádovou školu    
        </button></div>
      </div>`),
      { marker: marker }
    );
    marker.bindPopup(popup);
    marker.school = schoolMarker;
    addressLayerGroup.addLayer(marker);
    bounds.extend(marker.getLatLng());
    markers[point.address] = marker;
  });
};

const createZoomEndHandler = (
  map: LeafletMap,
  municipalityLayerGroups: AddressLayerGroup[]
) => {
  if (municipalityLayerGroups.length <= 1) {
    return emptyCallback;
  }
  let added = false;
  return () => {
    if (map.getZoom() < minZoomForAddressPoints && added === true) {
      municipalityLayerGroups.forEach((layerGroup) => {
        map.removeLayer(layerGroup);
      });
      added = false;
    }
    if (map.getZoom() >= minZoomForAddressPoints && added === false) {
      municipalityLayerGroups.forEach((layerGroup) => {
        map.addLayer(layerGroup);
      });
      added = true;
    }
  };
};

let _onError: (message: string) => void;

export const loadMapyCzSuggest = (
  element: HTMLElement,
  onError: (message: string) => void
) => {
  let suggest = new SMap.Suggest(element, {
    provider: new SMap.SuggestProvider({}),
  });
  suggest.addListener("suggest", onSuggest);
  suggest.addListener("enter", onSuggest);
  _onError = onError;
};

const findPointByGPS = (lat: number, lng: number) => {
  let minDistance = 9;
  let minDistancePoint = null;

  for (const municipality of _municipalities) {
    for (const school of municipality.schools) {
      for (const point of school.addresses) {
        if (!point.lat || !point.lng) {
          continue;
        }
        const distance = Math.abs(point.lat - lat) + Math.abs(point.lng - lng);
        if (distance < 0.00001) {
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

interface SuggestData {
  data: {
    latitude: number;
    longitude: number;
  };
  phrase: string;
}

const onSuggest = (suggestData: SuggestData) => {
  let marker;
  const key = Object.keys(markers).find((k) =>
    k.startsWith(suggestData.phrase)
  );

  if (key) {
    marker = markers[key];
  } else if (
    suggestData.data &&
    suggestData.data.longitude &&
    suggestData.data.latitude
  ) {
    const addressPoint = findPointByGPS(
      suggestData.data.latitude,
      suggestData.data.longitude
    );
    marker = addressPoint ? markers[addressPoint.address] : null;
  }

  if (marker) {
    centerLeafletMapOnMarker(marker);
  } else {
    if (_onError) {
      _onError(`Adresu '${suggestData.phrase}' jsme na mapě nenašli.`);
    }
  }
};

const centerLeafletMapOnMarker = (marker: CircleMarkerWithSchool) => {
  if (map === null || !marker.school) {
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
    if (marker.school) {
      marker.school.bringToFront();
      marker.school.openPopup();
    }
  });
  map.fitBounds(markerBounds, { padding: [150, 150] });
};

const selectMarker = (marker: CircleMarkerWithSchool) => {
  if (selectedMarker) {
    selectedMarker
      .setRadius(markerRadius)
      .setStyle({ weight: markerWeight, color: selectedMarkerOriginalColor });
  }
  selectedMarker = marker;
  selectedMarkerOriginalColor = marker.options.color || selectedMarkerColor;
  selectedMarker
    .setRadius(selectedMarkerRadius)
    .setStyle({ weight: selectedMarkerWeight, color: selectedMarkerColor });
};
