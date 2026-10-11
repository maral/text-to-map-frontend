import {
  AddressesFile,
  AddressMarkerMap,
  DataForMap,
  DeferredAddresses,
  Municipality,
} from "@/types/data";
import {
  createCityLayers,
  createZoomEndHandler,
  prepareMap,
  setupPopups,
} from "./mapUtils";
import L, { LayerGroup, Map as LeafletMap } from "leaflet";
import { centerLeafletMapOnMarker } from "./mapUtils";
import { SuggestionItem } from "../../types/suggestionTypes";

let map: LeafletMap;
let mapInitialized = false;
let _onError: (message: string) => void;
let markers: AddressMarkerMap;
let _municipalities: Municipality[];
// Resolves once address markers exist; loads deferred addresses if needed.
let ensureAddresses: () => Promise<void> = () => Promise.resolve();
let addressesReady = true;

export const createMap = (
  element: HTMLElement,
  data: DataForMap,
  showDebugInfo: boolean,
  onError: (message: string) => void,
  text?: string,
  center?: [number, number],
  zoom?: number,
  color?: string,
  showControls: boolean = true,
  deferredAddresses?: DeferredAddresses
): {
  onSuggestionSelect: (item: SuggestionItem) => void;
} => {
  if (!element || map || mapInitialized) {
    return {
      onSuggestionSelect: onSuggest,
    };
  }

  map = prepareMap(element, showControls);
  mapInitialized = true;
  _municipalities = data.municipalities;
  _onError = onError;

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
    addAddressMarkers,
  } = createCityLayers({
    data,
    showDebugInfo,
    color,
    lines: showDebugInfo && text ? text.split("\n") : undefined,
  });

  markers = addressMarkers;

  if (deferredAddresses) {
    addressesReady = false;
    let loading: Promise<void> | undefined;
    ensureAddresses = () => {
      loading ??= fetchAddresses(deferredAddresses, data.municipalities)
        .then((municipalities) => {
          _municipalities = municipalities;
          addAddressMarkers(municipalities);
          addressesReady = true;
        })
        .catch((error) => {
          // Let the next search try again.
          loading = undefined;
          throw error;
        });
      return loading;
    };
    ensureAddresses().catch((error) => onError(addressesErrorMessage(error)));
  }

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

  return {
    onSuggestionSelect: onSuggest,
  };
};

class DataChangedError extends Error {}

const addressesErrorMessage = (error: unknown) =>
  error instanceof DataChangedError
    ? "Data na mapě byla mezitím aktualizována. Obnovte prosím stránku."
    : "Nepodařilo se načíst adresní místa. Zkuste prosím obnovit stránku.";

/**
 * Loads addresses served separately from the page and puts them into the
 * page's municipalities. The version check guards against a page from one
 * deployment receiving addresses from a newer one, whose areas may differ.
 */
const fetchAddresses = async (
  { url, version }: DeferredAddresses,
  municipalities: Municipality[]
): Promise<Municipality[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status}`);
  }
  const file: AddressesFile = await response.json();
  if (file.version !== version) {
    throw new DataChangedError(`Expected addresses ${version}, got ${file.version}`);
  }
  return municipalities.map((municipality) => {
    const addresses = file.municipalities[municipality.code];
    if (addresses?.areas.length !== municipality.areas.length) {
      throw new DataChangedError(`Addresses of ${municipality.code} don't match`);
    }
    return {
      ...municipality,
      areas: municipality.areas.map((area, index) => ({
        ...area,
        addresses: addresses.areas[index],
      })),
      unmappedPoints: addresses.unmappedPoints,
    };
  });
};

const findPointByGPS = (lat: number, lng: number) => {
  let minDistance = 9;
  let minDistancePoint = null;

  for (const municipality of _municipalities) {
    for (const area of municipality.areas) {
      for (const point of area.addresses) {
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

export const onSuggest = async (item: SuggestionItem) => {
  if (!addressesReady) {
    _onError?.("Načítám adresní místa…");
  }
  try {
    await ensureAddresses();
  } catch (error) {
    _onError?.(addressesErrorMessage(error));
    return;
  }

  let marker;
  const key = Object.keys(markers).find((k) => k.startsWith(item.name));

  if (key) {
    marker = markers[key];
  } else if (item.position.lat && item.position.lon) {
    const addressPoint = findPointByGPS(item.position.lat, item.position.lon);
    marker = addressPoint ? markers[addressPoint.address] : null;
  }

  if (marker) {
    centerLeafletMapOnMarker(map, marker[0]);
  } else {
    if (_onError) {
      _onError(`Adresu '${item.name}' jsme na mapě nenašli.`);
    }
  }
};
