import { PageType, EmbedQueryParams } from "@/types/page";

const DEFAULT_QUERY_PARAMS: Map<PageType, EmbedQueryParams> = new Map([
  [
    PageType.All,
    {
      color: undefined,
      zoom: undefined,
      center: undefined,
      showSearch: true,
      showControls: true,
      showMenu: true,
      mode: "points",
      isEmbed: true,
      isReady: false,
    },
  ],
  [
    PageType.Municipality,
    {
      color: undefined,
      zoom: undefined,
      center: undefined,
      showSearch: true,
      showControls: true,
      showMenu: false,
      mode: "points",
      isEmbed: true,
      isReady: false,
    },
  ],
  [
    PageType.School,
    {
      color: undefined,
      zoom: undefined,
      center: undefined,
      showSearch: false,
      showControls: true,
      showMenu: false,
      mode: "points",
      isEmbed: true,
      isReady: false,
    },
  ],
]);

export const getDefaultParams = (
  type: PageType = PageType.All
): EmbedQueryParams => {
  const defaults = DEFAULT_QUERY_PARAMS.get(type);
  if (!defaults) {
    throw new Error("Invalid page type");
  }
  return defaults;
};
