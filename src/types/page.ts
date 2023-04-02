export enum PageType {
  All = "all",
  Municipality = "municipality",
  School = "school",
}

export interface EmbedQueryParams {
  color?: string;
  zoom?: number;
  center?: [number, number];
  showSearch: boolean;
  showControls: boolean;
  showMenu: boolean;
  mode: "points" | "polygons";
  isEmbed: boolean;
  isReady: boolean;
}
