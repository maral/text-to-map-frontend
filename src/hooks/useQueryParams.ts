import { PageType } from "@/types/page";
import { useRouter } from "next/router";

interface SanitizedQueryParams {
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

const DEFAULT_QUERY_PARAMS: Map<PageType, SanitizedQueryParams> = new Map([
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

const sanitizeColor = (value?: string): string | undefined => {
  if (value && CSS.supports("color", value)) {
    return value;
  }
  return undefined;
};

const sanitizeZoom = (value?: string): number | undefined => {
  if (value) {
    const zoom = parseInt(value, 10);
    if (zoom >= 0 && zoom <= 20) {
      return zoom;
    }
  }
  return undefined;
};

const sanitizeBool = (value?: string | boolean): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  } else if (typeof value === "string") {
    if (value === "0" || value === "false") {
      return false;
    } else if (value === "1" || value === "true") {
      return true;
    }
    return undefined;
  }
};

const sanitizeBoolRequired = (value?: string | boolean): boolean => {
  return sanitizeBool(value) || false;
};

const sanitizeFloat = (value?: string): number | undefined => {
  if (value) {
    const float = parseFloat(value);
    if (!isNaN(float)) {
      return float;
    }
  }
  return undefined;
};

const useQueryParams = (
  type: PageType = PageType.All
): SanitizedQueryParams => {
  const router = useRouter();

  const defaults = DEFAULT_QUERY_PARAMS.get(type);
  if (!defaults) {
    throw new Error("Invalid page type");
  }

  const color = sanitizeColor(router.query.color?.toString() || defaults.color);
  const zoom = sanitizeZoom(router.query.zoom?.toString() || defaults.color);
  const showSearch = sanitizeBoolRequired(
    router.query.search?.toString() || defaults.showSearch
  );
  const lat = sanitizeFloat(router.query.lat?.toString());
  const lon = sanitizeFloat(router.query.lon?.toString());
  const center: [number, number] | undefined =
    lat && lon ? [lat, lon] : defaults.center;

  return {
    ...defaults,
    color,
    zoom,
    center,
    showSearch,
    isReady: router.isReady,
  };
};

export default useQueryParams;
