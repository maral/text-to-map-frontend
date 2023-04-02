export interface Address {
  address: string;
  lat: number;
  lng: number;
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
  addresses: Address[];
  position: Position;
}

export interface Municipality {
  municipalityName: string;
  schools: School[];
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
