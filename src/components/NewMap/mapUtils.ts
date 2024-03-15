import {
  AddressLayerGroup,
  AddressMarkerMap,
  AddressesLayerGroup,
  DataForMap,
  DataForMapByCityCodes,
  MarkerWithSchools,
  SchoolLayerGroup,
  SchoolMarker,
  SchoolMarkerMap,
  isPopupWithMarker,
} from "@/types/data";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { Feature, MultiPolygon, Polygon } from "@turf/helpers";
import L, { Circle, Map, Polyline, PopupEvent } from "leaflet";
import { createMarkers } from "./markers";

export const colors = [
  "#d33d81",
  "#0ea13b",
  "#0082ad",
  "#f17b5a",
  "#c45a18",
  "#2bc6d9",
  "#c686d0",
  "#81b2e9",
  "#6279bd",
];

const unmappedPolygonColor = "#888888";

export const markerRadius = 4;
export const markerWeight = 2;
export const selectedMarkerRadius = 8;
export const selectedMarkerWeight = 5;
export const minZoomForAddressPoints = 16;
export const selectedMarkerColor = "#ffff00";

export const prepareMap = (
  element: HTMLElement,
  showControls: boolean
): Map => {
  const map = L.map(element, {
    renderer: L.canvas({ padding: 0.5 }),
    zoomControl: false,
  });
  if (showControls) {
    L.control.zoom({ position: "topleft" }).addTo(map);
  }
  L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
};

let lastListener: () => void;

export const setupPopups = (map: Map): void => {
  map.on("popupopen", function (e: PopupEvent) {
    resetAllHighlights();
    const popup = e.popup;
    if (isPopupWithMarker(popup)) {
      lastListener = () => {
        centerLeafletMapOnMarker(map, popup.marker);
      };
      const button =
        // @ts-ignore not ideal but unfortunately not other way to get the button
        e.popup._source._popup._contentNode.querySelector(".marker-button");
      if (button) {
        button.addEventListener("click", lastListener);
      }
    }
  });

  map.on("popupclose", function (e: PopupEvent) {
    if (doNotRemoveHighlights) {
      return;
    }
    const popup = e.popup;
    if (isPopupWithMarker(popup) && lastListener) {
      const button =
        // @ts-ignore
        e.popup._source._popup._contentNode.querySelector(".marker-button");
      if (button) {
        button.removeEventListener("click", lastListener);
      }
    }
    resetAllHighlights();
  });

  map.on("click", function () {
    resetAllHighlights(true);
  });
};

const setUpSchoolMarkersEvents = (
  schoolMarkers: SchoolMarkerMap,
  polygonLayer: L.GeoJSON
) => {
  Object.entries(schoolMarkers).forEach(([schoolIzo, marker]) => {
    marker.on("click", function (e) {
      // check polygonLayer is currently visible
      if (!(polygonLayer as any)._map) {
        return;
      }
      resetAllHighlights();
      schoolHighlighted = true;
      lastPolygonLayer = polygonLayer;
      // when we click on a school marker, we want to hide all other polygons
      // leave only the one that is related to the school
      polygonLayer.getLayers().forEach((_layer) => {
        const layer = _layer as L.Polygon & {
          feature: Feature<Polygon | MultiPolygon>;
        };
        if (layer.feature.properties?.schoolIzo !== schoolIzo) {
          layer.setStyle({ fillOpacity: 0.1, opacity: 0.3, fillColor: "#888" });
          layer.bringToBack();
        } else {
          const map = (polygonLayer as any)._map;
          map.flyToBounds(layer.getBounds(), { duration: 0.7 });
          layer.setStyle({ color: layer.options.fillColor }); // "#9b0505"
        }
      });
      selectSchool(marker);
    });
  });
};

let polylines: Polyline[];
let selectedSchools = new Set<Circle>();
let lastPolygonLayer: L.GeoJSON | undefined;
let schoolHighlighted = false;
let addressHighlighted = false;
let markerClone: Circle | undefined;
let doNotRemoveHighlights = false;

const isSomethingHighlighted = () => {
  return schoolHighlighted || addressHighlighted;
};

export const resetAllHighlights = (exceptPolygonHighlights = false) => {
  if (!isSomethingHighlighted() && exceptPolygonHighlights) {
    return;
  }
  if (lastPolygonLayer) {
    lastPolygonLayer.resetStyle();
    lastPolygonLayer = undefined;
  }
  if (markerClone) {
    markerClone.remove();
    markerClone = undefined;
  }
  if (polylines) {
    polylines.forEach((p) => p.remove());
  }
  selectedSchools.forEach(deselectSchool);
  schoolHighlighted = false;
  addressHighlighted = false;
};

export const centerLeafletMapOnMarker = (
  map: Map,
  marker: MarkerWithSchools
) => {
  if (map === null || !marker.schools || marker.schools.length === 0) {
    return;
  }

  doNotRemoveHighlights = true;
  const newMarker = L.circle(marker.getLatLng(), marker.options)
    .bindPopup(marker.getPopup()!.getContent()!)
    .addTo(map)
    .openPopup();

  const latLngs = [
    marker.getLatLng(),
    ...marker.schools.map((m) => m.getLatLng()),
  ];
  const markerBounds = L.latLngBounds(latLngs);
  resetAllHighlights();
  addressHighlighted = true;
  polylines = [];
  marker.schools.forEach((school) => {
    polylines.push(
      L.polyline([marker.getLatLng(), school.getLatLng()], {
        color: "red",
        dashArray: "10, 10",
      })
        .addTo(map)
        .bringToBack()
    );

    selectSchool(school);
  });
  markerClone = newMarker;
  map.once("moveend", function () {});
  map.flyToBounds(markerBounds, { padding: [150, 150], duration: 0.7 });
};

const selectSchool = (school: SchoolMarker) => {
  school.setStyle({ color: selectedMarkerColor });
  const tooltip = school.getTooltip()!;
  school.unbindTooltip();
  tooltip.options.permanent = true;
  school.bindTooltip(tooltip);
  selectedSchools.add(school);
};

const deselectSchool = (school: SchoolMarker) => {
  school.setStyle({ color: school.options.fillColor });
  const tooltip = school.getTooltip()!;
  school.unbindTooltip();
  tooltip.options.permanent = false;
  school.bindTooltip(tooltip);
  selectedSchools.delete(school);
};

export const loadMunicipalitiesByCityCodes = async (
  cityCodes: number[]
): Promise<DataForMapByCityCodes | null> => {
  const response = await fetch("/api/map/municipalities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cityCodes }),
  });

  if (response.ok) {
    const { dataForMapByCityCodes } = (await response.json()) as {
      dataForMapByCityCodes: DataForMapByCityCodes;
    };
    return dataForMapByCityCodes;
  } else {
    console.error("Error while loading municipalities");
    return null;
  }
};

export const createCityLayers = ({
  data,
  cityCode,
  lines,
  showDebugInfo = false,
}: {
  data: DataForMap;
  lines?: string[];
  showDebugInfo?: boolean;
  cityCode?: string;
}): {
  addressesLayerGroup: AddressLayerGroup;
  schoolsLayerGroup: SchoolLayerGroup;
  polygonLayer: L.GeoJSON;
  unmappedLayerGroup: AddressLayerGroup;
  municipalityLayerGroups: AddressLayerGroup[];
  addressMarkers: AddressMarkerMap;
} => {
  const addressesLayerGroup: AddressesLayerGroup = L.layerGroup(undefined, {
    pane: "markerPane",
  });
  const schoolsLayerGroup: SchoolLayerGroup = L.featureGroup();
  const municipalityLayerGroups: AddressLayerGroup[] = [];
  const schoolMarkers: SchoolMarkerMap = {};
  const addressMarkers: AddressMarkerMap = {};

  addressesLayerGroup.cityCode = cityCode;
  addressesLayerGroup.type = "addresses";
  schoolsLayerGroup.cityCode = cityCode;
  schoolsLayerGroup.type = "schools";

  const unmappedLayerGroup: AddressLayerGroup = L.layerGroup();

  createMarkers(
    data,
    municipalityLayerGroups,
    addressesLayerGroup,
    schoolsLayerGroup,
    unmappedLayerGroup,
    schoolMarkers,
    addressMarkers,
    showDebugInfo,
    lines
  );

  const polygonLayer = createPolygonLayer(data, schoolMarkers);

  setUpSchoolMarkersEvents(schoolMarkers, polygonLayer);

  return {
    addressesLayerGroup,
    schoolsLayerGroup,
    polygonLayer,
    unmappedLayerGroup,
    municipalityLayerGroups,
    addressMarkers,
  };
};

const createPolygonLayer = (
  data: DataForMap,
  schoolMarkers: SchoolMarkerMap
) => {
  const geoJsonLayer: L.GeoJSON = L.geoJSON(data.polygons, {
    pane: "overlayPane",
    style: (feature) => {
      return feature
        ? {
            fillColor:
              feature?.properties.colorIndex === -1
                ? unmappedPolygonColor
                : colors[feature.properties.colorIndex % colors.length],
            color: "#777",
            weight: 2,
            fillOpacity: 0.4,
          }
        : {};
    },
    bubblingMouseEvents: false,
  })
    .on("mouseout", (e) => handleMouseMove(schoolMarkers, geoJsonLayer, e))
    .on("mousemove", (e) => handleMouseMove(schoolMarkers, geoJsonLayer, e));
  return geoJsonLayer;
};

const handleMouseMove = (
  schoolMarkers: SchoolMarkerMap,
  geoJsonLayer: L.GeoJSON,
  e: L.LeafletMouseEvent
) => {
  if (isSomethingHighlighted()) {
    return;
  }

  const relatedSchoolMarkers = geoJsonLayer
    .getLayers()
    .map((layer) => {
      const feature: Feature<Polygon | MultiPolygon> = (layer as any).feature;
      if (booleanPointInPolygon([e.latlng.lng, e.latlng.lat], feature)) {
        return schoolMarkers[feature.properties?.schoolIzo];
      }
    })
    .filter((marker) => marker !== undefined) as L.Circle[];

  // add all new schools
  relatedSchoolMarkers.forEach((marker) => {
    if (!selectedSchools.has(marker)) {
      selectSchool(marker);
    }
  });

  // remove all selected schools that are no longer hovered over
  selectedSchools.forEach((marker) => {
    if (!relatedSchoolMarkers.includes(marker)) {
      deselectSchool(marker);
    }
  });
};

export const createZoomEndHandler = (
  map: Map,
  municipalityLayerGroups: AddressLayerGroup[]
) => {
  if (municipalityLayerGroups.length <= 1) {
    return () => {};
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
