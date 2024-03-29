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

export interface Municipality {
  municipalityName: string;
  code: number;
  schools: School[];
  wholeMunicipalityPoints: Address[];
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

import { FeatureCollection } from "@turf/helpers";
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
