import { PageType, EmbedQueryParams } from "@/types/page";
import { getDefaultParams } from "@/utils/defaultParams";
import { useRouter } from "next/router";

const sanitizeColor = (value?: string): string | undefined => {
  if (value && CSS.supports("color", value)) {
    return value;
  } else if (value && CSS.supports("color", `#${value}`)) {
    return `#${value}`;
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

const sanitizeBool = (
  value?: string | boolean,
  defaultValue?: boolean
): boolean => {
  if (typeof value === "boolean") {
    return value;
  } else if (typeof value === "string") {
    if (value === "0" || value === "false") {
      return false;
    } else if (value === "1" || value === "true") {
      return true;
    }
  }
  if (typeof defaultValue === "boolean") {
    return defaultValue;
  }
  return false;
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

const useQueryParams = (type: PageType = PageType.All): EmbedQueryParams => {
  const router = useRouter();

  const defaults = getDefaultParams(type);
  if (!defaults) {
    throw new Error("Invalid page type");
  }

  const color = sanitizeColor(router.query.color?.toString() || defaults.color);
  const zoom = sanitizeZoom(router.query.zoom?.toString() || defaults.color);
  const showSearch = sanitizeBool(
    router.query.search?.toString(),
    defaults.showSearch
  );
  const showControls = sanitizeBool(
    router.query.controls?.toString(),
    defaults.showControls
  );
  const showMenu = sanitizeBool(
    router.query.menu?.toString(),
    defaults.showMenu
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
    showControls,
    showMenu,
    isReady: router.isReady,
  };
};

export default useQueryParams;
