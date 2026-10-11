import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Feature, FeatureCollection } from "geojson";
import { DataForMap, Municipality, PolygonMap } from "@/types/data";

/**
 * Loads Prague catchment area data for the newest ordinance from
 * mapaspadovosti.softresource.cz, the source of truth for it.
 *
 * Data is fetched at build time and cached on disk for a week, so local dev
 * and repeated builds don't re-download it. Production stays fresh because the
 * site is rebuilt weekly (see .github/workflows/weekly-rebuild.yml) on a fresh
 * machine with an empty cache.
 */

const SOURCE_ORIGIN = "https://mapaspadovosti.softresource.cz";
// RÚIAN code of Hlavní město Praha; identifies Prague's row on the /data page.
const PRAGUE_CITY_CODE = "554782";
// Used when the current ordinance ID can't be found on the /data page.
const FALLBACK_ORDINANCE_ID = 898;

const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_DIR = path.join(os.tmpdir(), "text-to-map-source-data");
const CACHE_FILE = path.join(CACHE_DIR, "praha-v2.json");
const LOCK_DIR = path.join(CACHE_DIR, "lock");
const LOCK_STALE_MS = 3 * 60 * 1000;
const LOCK_WAIT_MS = 4 * 60 * 1000;

const FETCH_TIMEOUT_MS = 60 * 1000;
const MAX_RESPONSE_BYTES = 64 * 1024 * 1024;

export interface SourceData {
  data: DataForMap;
  // Street Markdown text the address lineNumbers point into, if published.
  ordinanceText: string | null;
}

interface CachedSourceData extends SourceData {
  fetchedAt: number;
  ordinanceId: number;
}

let inMemory: Promise<SourceData> | undefined;

export const getSourceData = (): Promise<SourceData> => {
  if (!inMemory) {
    inMemory = loadSourceData().catch((error) => {
      inMemory = undefined;
      throw error;
    });
  }
  return inMemory;
};

const loadSourceData = async (): Promise<SourceData> => {
  const cached = await readFreshCache();
  if (cached) {
    return cached;
  }

  // Next.js builds pages in several worker processes; the lock makes sure only
  // one of them downloads the data while the others wait for the cache file.
  const deadline = Date.now() + LOCK_WAIT_MS;
  while (!(await tryAcquireLock())) {
    if (Date.now() > deadline) {
      throw new Error("Timed out waiting for another process to fetch data");
    }
    await sleep(500);
    const cached = await readFreshCache();
    if (cached) {
      return cached;
    }
  }

  try {
    const cached = await readFreshCache();
    if (cached) {
      return cached;
    }
    const fresh = await fetchSourceData();
    await writeCache(fresh);
    return fresh;
  } finally {
    await fs.rm(LOCK_DIR, { recursive: true, force: true });
  }
};

const fetchSourceData = async (): Promise<CachedSourceData> => {
  const ordinanceId = await findPragueOrdinanceId();
  console.log(
    `[source-data] Downloading Prague data (ordinance ${ordinanceId}) from ${SOURCE_ORIGIN}`
  );

  const [municipalities, polygons, ordinanceText] = await Promise.all([
    fetchJson(`/api/download/address-points/${ordinanceId}`),
    fetchJson(`/api/download/polygons/${ordinanceId}`),
    fetchFromSource("/api/smd/praha", { optional: true }),
  ]);

  validateMunicipalities(municipalities);
  validatePolygons(polygons);
  // Guards against picking up another city's ordinance from the /data page.
  if (
    !municipalities.every(
      ({ municipalityName, municipalityType }) =>
        municipalityType === "district" &&
        municipalityName.startsWith("Městská část Praha")
    )
  ) {
    fail(`ordinance ${ordinanceId} is not Prague's`);
  }

  return {
    fetchedAt: Date.now(),
    ordinanceId,
    data: {
      municipalities,
      polygons: groupPolygonsByMunicipality(municipalities, polygons),
    },
    ordinanceText: checkOrdinanceText(ordinanceText, municipalities),
  };
};

/**
 * The debug view shows the ordinance lines each address came from, so the text
 * must be the exact version the data was generated from. Each line referenced
 * by an address has to sit under its own municipality's "# <name>" heading;
 * otherwise it's a different version or order: better none than wrong lines.
 */
const checkOrdinanceText = (
  text: string | null,
  municipalities: Municipality[]
): string | null => {
  if (text === null) {
    return null;
  }
  const sectionOfLine: (string | undefined)[] = [];
  let section: string | undefined;
  for (const line of text.split("\n")) {
    if (line.startsWith("# ")) {
      section = line.slice(2).trim();
    }
    sectionOfLine.push(section);
  }
  const fits = municipalities.every((municipality) =>
    [
      ...municipality.unmappedPoints,
      ...municipality.areas.flatMap((area) => area.addresses),
    ].every((address) =>
      (address.lineNumbers ?? []).every(
        (line) => sectionOfLine[line] === municipality.municipalityName
      )
    )
  );
  if (!fits) {
    console.warn(
      "[source-data] Street Markdown text doesn't match the address data, ignoring it"
    );
    return null;
  }
  return text;
};

const findPragueOrdinanceId = async (): Promise<number> => {
  try {
    const html = await fetchFromSource("/data");
    // The table rows are keyed by city code in the page's (React Server
    // Components) payload. A row can be split across payload chunks, so only
    // look up to the next row and take the first download link: they all
    // share the ordinance ID, and the first one comes right after the key.
    const rowKey = (code: string) =>
      new RegExp(String.raw`\\?"\$L\w+\\?",\\?"${code}\\?",\{`);
    const key = rowKey(PRAGUE_CITY_CODE).exec(html);
    if (key) {
      const rest = html.slice(key.index + key[0].length);
      const rowEnd = rest.search(rowKey(String.raw`\d+`));
      const row = rowEnd >= 0 ? rest.slice(0, rowEnd) : rest;
      const match = row.match(
        /\/api\/(?:ordinances\/download\/by-id|download\/[a-z-]+)\/(\d+)/
      );
      if (match) {
        return Number(match[1]);
      }
    }
    console.warn(
      `[source-data] Prague ordinance not found on /data page, using ${FALLBACK_ORDINANCE_ID}`
    );
  } catch (error) {
    console.warn(
      `[source-data] Failed to read /data page, using ordinance ${FALLBACK_ORDINANCE_ID}:`,
      error
    );
  }
  return FALLBACK_ORDINANCE_ID;
};

/**
 * The source publishes polygons as one flat FeatureCollection; the app expects
 * them grouped by municipality code. Each polygon's areaIndex matches exactly
 * one area index in the address data, which tells us its municipality.
 */
const groupPolygonsByMunicipality = (
  municipalities: Municipality[],
  polygons: FeatureCollection
): PolygonMap => {
  const areaIndexToCode = new Map<number, number>();
  for (const municipality of municipalities) {
    for (const area of municipality.areas) {
      areaIndexToCode.set(area.index, municipality.code);
    }
  }

  const result: PolygonMap = {};
  for (const municipality of municipalities) {
    result[municipality.code] = { type: "FeatureCollection", features: [] };
  }

  for (const feature of polygons.features) {
    const code = areaIndexToCode.get(feature.properties?.areaIndex);
    if (code === undefined) {
      throw new Error(
        `Polygon with areaIndex ${feature.properties?.areaIndex} has no matching area`
      );
    }
    result[code].features.push(feature);
  }

  return result;
};

/**
 * With `optional`, a missing resource (404, or an HTML page instead of the
 * file) resolves to null instead of failing the build.
 */
async function fetchFromSource(pathname: string): Promise<string>;
async function fetchFromSource(
  pathname: string,
  options: { optional: true }
): Promise<string | null>;
async function fetchFromSource(
  pathname: string,
  { optional = false } = {}
): Promise<string | null> {
  const url = new URL(pathname, SOURCE_ORIGIN);
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (
    optional &&
    (response.status === 404 ||
      response.headers.get("content-type")?.includes("text/html"))
  ) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status}`);
  }
  const length = Number(response.headers.get("content-length"));
  if (length > MAX_RESPONSE_BYTES) {
    throw new Error(`GET ${url} response too large: ${length} bytes`);
  }
  const body = await response.text();
  if (body.length > MAX_RESPONSE_BYTES) {
    throw new Error(`GET ${url} response too large`);
  }
  return body;
}

const fetchJson = async (pathname: string) =>
  JSON.parse(await fetchFromSource(pathname));

const readFreshCache = async (): Promise<CachedSourceData | undefined> => {
  try {
    const cached: CachedSourceData = JSON.parse(
      await fs.readFile(CACHE_FILE, "utf8")
    );
    if (Date.now() - cached.fetchedAt < CACHE_MAX_AGE_MS) {
      return cached;
    }
  } catch {
    // Missing or unreadable cache, fetch again.
  }
  return undefined;
};

const writeCache = async (data: CachedSourceData) => {
  const tmpFile = `${CACHE_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(data));
  await fs.rename(tmpFile, CACHE_FILE);
};

const tryAcquireLock = async (): Promise<boolean> => {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  try {
    await fs.mkdir(LOCK_DIR);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
  // Clean up after a process that crashed while holding the lock.
  try {
    const { mtimeMs } = await fs.stat(LOCK_DIR);
    if (Date.now() - mtimeMs > LOCK_STALE_MS) {
      await fs.rm(LOCK_DIR, { recursive: true, force: true });
    }
  } catch {
    // Lock was released in the meantime.
  }
  return false;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Validation: the data comes from a third party, so check its shape before
// building pages from it rather than failing obscurely (or rendering junk).

const fail = (message: string): never => {
  throw new Error(`Invalid source data: ${message}`);
};

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === "string";

const validateAddress = (address: any, where: string) => {
  if (
    !isString(address?.address) ||
    !isNumber(address.lat) ||
    !isNumber(address.lng) ||
    (address.lineNumbers !== undefined &&
      !(
        Array.isArray(address.lineNumbers) &&
        address.lineNumbers.every(isNumber)
      ))
  ) {
    fail(`bad address in ${where}`);
  }
};

function validateMunicipalities(data: any): asserts data is Municipality[] {
  if (!Array.isArray(data) || data.length === 0) {
    fail("expected a non-empty list of municipalities");
  }
  for (const municipality of data) {
    const name = municipality?.municipalityName;
    if (!isString(name) || !isNumber(municipality.code)) {
      fail("municipality without name or code");
    }
    if (!Array.isArray(municipality.areas)) {
      fail(`${name} has no areas`);
    }
    for (const area of municipality.areas) {
      if (!isNumber(area?.index) || !Array.isArray(area.schools)) {
        fail(`bad area in ${name}`);
      }
      for (const school of area.schools) {
        if (!isString(school?.name) || !isString(school.izo)) {
          fail(`bad school in ${name}`);
        }
        if (
          school.position &&
          (!isNumber(school.position.lat) || !isNumber(school.position.lng))
        ) {
          fail(`bad position of ${school.name}`);
        }
      }
      if (!Array.isArray(area.addresses)) {
        fail(`bad addresses in ${name}`);
      }
      area.addresses.forEach((address: unknown) =>
        validateAddress(address, name)
      );
    }
    if (!Array.isArray(municipality.unmappedPoints)) {
      fail(`bad unmapped points in ${name}`);
    }
    municipality.unmappedPoints.forEach((address: unknown) =>
      validateAddress(address, name)
    );
  }
}

function validatePolygons(data: any): asserts data is FeatureCollection {
  if (data?.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    fail("expected a polygon FeatureCollection");
  }
  data.features.forEach((feature: Feature) => {
    const properties = feature?.properties;
    if (
      feature.type !== "Feature" ||
      !isNumber(properties?.areaIndex) ||
      !isNumber(properties?.colorIndex) ||
      !Array.isArray(properties?.schoolIzos) ||
      !properties.schoolIzos.every(isString) ||
      !["Polygon", "MultiPolygon"].includes(feature.geometry?.type)
    ) {
      fail("bad polygon feature");
    }
  });
}
