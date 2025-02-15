export type SuggestionPosition = {
  lon: number;
  lat: number;
};

type RegionalStructure = {
  name: string;
  type:
    | "regional"
    | "regional.country"
    | "regional.region"
    | "regional.municipality"
    | "regional.municipality_part"
    | "regional.street"
    | "regional.address"
    | "poi";
  isoCode?: string;
};

export type SuggestionItem = {
  name: string;
  label: string;
  position: SuggestionPosition;
  type: string;
  location: string;
  regionalStructure: RegionalStructure[];
  zip: string;
};

export type SuggestionsResponse = {
  items: SuggestionItem[];
};
