export interface Address {
  address: string;
  lat: number;
  lng: number;
  lineNumbers?: number[];
}

export interface Position {
  id: number;
  address: string;
  type: number;
  descriptiveNumber: number;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  street: string;
  orientationalNumber: number;
  municipalityPart: string;
}

export interface School {
  name: string;
  izo: string;
  isWholeMunicipality: boolean;
  addresses: Address[];
  position: Position;
}

export interface Area {
  index: number;
  schools: School[];
  addresses: Address[];
}

export interface Municipality {
  municipalityName: string;
  code: number;
  municipalityType: "city" | "district";
  cityCodes: number[];
  districtCodes: number[];
  areas: Area[];
  unmappedPoints: Address[];
}

export type Data = Municipality[] | null;

export interface SlugWithName {
  name: string;
  slug: string;
}

export interface SchoolSlugsMunicipality {
  municipalityName: string;
  schools: SlugWithName[];
}

export type SchoolSlugs = SchoolSlugsMunicipality[];

export type MunicipalitySlugs = SlugWithName[];

import type { FeatureCollection } from "geojson";
// new types

import {
  Circle,
  LayerGroup,
  Marker,
  Popup,
  GeoJSON,
  FeatureGroup,
} from "leaflet";

export type SchoolMarker = Circle;

export type MarkerWithSchools = (Marker | Circle) & {
  schools?: Circle[];
};

export interface PopupWithMarker extends Popup {
  marker: MarkerWithSchools;
}

export const isPopupWithMarker = (popup: Popup): popup is PopupWithMarker => {
  return popup.hasOwnProperty("marker");
};

export type SchoolMarkerMap = Record<string, SchoolMarker>;
export type AddressMarkerMap = Record<string, MarkerWithSchools[]>;
export type AddressLayerGroup = LayerGroup<MarkerWithSchools> & {
  name?: string;
};
export type AddressesLayerGroup = LayerGroup & {
  cityCode?: string;
  type?: string;
};
export type SchoolLayerGroup = FeatureGroup<MarkerWithSchools | Circle> & {
  cityCode?: string;
  type?: string;
};

export interface CityOnMap {
  code: number;
  name: string;
  isPublished: boolean;
  lat: number;
  lng: number;
}

export type PolygonMap = { [municipalityCode in string]: FeatureCollection };

export type DataForMap = {
  municipalities: Municipality[];
  polygons: PolygonMap;
};

/**
 * Addresses served separately from the page (see /data/addresses/[year]), so
 * the map can render schools and polygons first. Keyed by municipality code,
 * with areas in the same order as in the page data.
 */
export interface AddressesFile {
  version: string;
  municipalities: Record<
    string,
    { areas: Address[][]; unmappedPoints: Address[] }
  >;
}

/** Where the page loads its addresses from, and which version it expects. */
export interface DeferredAddresses {
  url: string;
  version: string;
}

export type DataForMapByCityCodes = Record<number, DataForMap>;

export type LoadedCitiesData = Record<number, CityData>;

export interface CityData {
  city: CityOnMap;
  data: DataForMap;
  addressesLayerGroup: AddressLayerGroup;
  schoolsLayerGroup: SchoolLayerGroup;
  polygonLayer: GeoJSON;
  addressMarkers: AddressMarkerMap;
}
