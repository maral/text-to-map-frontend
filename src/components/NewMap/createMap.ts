import { AddressMarkerMap, DataForMap, Municipality } from "@/types/data";
import {
  createCityLayers,
  createZoomEndHandler,
  prepareMap,
  setupPopups,
} from "./mapUtils";
import L, { LayerGroup, Map as LeafletMap } from "leaflet";

let map: LeafletMap;
let mapInitialized = false;
let markers: AddressMarkerMap;
let _municipalities: Municipality[];

export const createMap = (
  element: HTMLElement,
  data: DataForMap,
  showDebugInfo: boolean,
  text?: string,
  center?: [number, number],
  zoom?: number,
  color?: string,
  showControls: boolean = true
): (() => void) => {
  if (!element || map || mapInitialized) {
    return () => null;
  }

  map = prepareMap(element, showControls);
  mapInitialized = true;
  _municipalities = data.municipalities;

  L.circle([52, 12], {
    radius: 8,
    weight: 8,
    fill: true,
    fillColor: "red",
    fillOpacity: 1,
    color: "red",
  });

  const {
    addressesLayerGroup,
    schoolsLayerGroup,
    unmappedLayerGroup,
    polygonLayerGroup,
    municipalityLayerGroups,
    addressMarkers,
  } = createCityLayers({
    data,
    showDebugInfo,
    color,
    lines: showDebugInfo && text ? text.split("\n") : [],
  });

  markers = addressMarkers;

  const layerGroupsForControl: Record<string, LayerGroup> = {};

  layerGroupsForControl["Školy"] = schoolsLayerGroup;
  layerGroupsForControl["Oblasti"] = polygonLayerGroup;
  if (showDebugInfo) {
    layerGroupsForControl["Neurčené adresy"] = unmappedLayerGroup;
  }
  municipalityLayerGroups.forEach((group) => {
    layerGroupsForControl[group.name ?? "a"] = group;
  });
  // layerGroupsForControl["Adresní body"] = addressesLayerGroup;

  setupPopups(map);

  if (center) {
    map.setView(center, zoom ?? 15);
  } else {
    map.fitBounds(polygonLayerGroup.getBounds());
    if (zoom) {
      map.setZoom(zoom);
    }
  }

  if (data.municipalities.length > 1 && showControls) {
    L.control.layers(undefined, layerGroupsForControl).addTo(map);
  }

  map.addLayer(polygonLayerGroup);
  map.addLayer(unmappedLayerGroup);
  if (data.municipalities.length === 1) {
    map.addLayer(municipalityLayerGroups[0]);
  }

  map.addLayer(schoolsLayerGroup);

  polygonLayerGroup.on("add", () => {
    polygonLayerGroup.bringToBack();
  });

  addressesLayerGroup.on("add", () => {
    schoolsLayerGroup.bringToFront();
  });

  const zoomEndHandler = createZoomEndHandler(map, municipalityLayerGroups);
  map.on("zoomend", zoomEndHandler);
  zoomEndHandler();

  return () => {
    map.remove();
    mapInitialized = false;
  };
};

import { centerLeafletMapOnMarker } from "./mapUtils";

interface SuggestData {
  data: {
    latitude: number;
    longitude: number;
  };
  phrase: string;
}

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
    for (const area of municipality.areas) {
      for (const school of area.schools) {
        for (const point of school.addresses) {
          if (!point.lat || !point.lng) {
            continue;
          }
          const distance =
            Math.abs(point.lat - lat) + Math.abs(point.lng - lng);
          if (distance < 0.00001) {
            return point;
          } else if (distance < 0.0001 && distance < minDistance) {
            minDistance = distance;
            minDistancePoint = point;
          }
        }
      }
    }
  }
  return minDistancePoint;
};

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
    centerLeafletMapOnMarker(map, marker[0]);
  } else {
    if (_onError) {
      _onError(`Adresu '${suggestData.phrase}' jsme na mapě nenašli.`);
    }
  }
};
