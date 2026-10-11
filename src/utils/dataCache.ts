import fs from "fs/promises";
import path from "path";
import slug from "slug";
import {
  DataForMap,
  Municipality,
  PolygonMap,
  SchoolSlugs,
} from "@/types/data";
import { getSourceData } from "@/utils/sourceData";
import years from "@/config/years.json";
import schoolRedirects from "@/config/school-redirects.json";

// CURRENT_YEAR is shown on the main pages (/, /m, /s, /embed, /chyby).
// SOURCE_YEAR is the newest ordinance, loaded from
// mapaspadovosti.softresource.cz (see sourceData.ts). Other years are served
// from snapshots in public/.
const CURRENT_YEAR = years.currentYear;
const SOURCE_YEAR = years.sourceYear;

const datasets = new Map<number, Promise<DataForMap>>();

const loadData = (year = CURRENT_YEAR): Promise<DataForMap> => {
  let dataset = datasets.get(year);
  if (!dataset) {
    dataset =
      year === SOURCE_YEAR
        ? getSourceData().then(({ data }) => data)
        : loadArchivedData(year);
    datasets.set(year, dataset);
    dataset.catch(() => datasets.delete(year));
  }
  return dataset;
};

const readPublicJson = async (fileName: string) =>
  JSON.parse(
    await fs.readFile(path.join(process.cwd(), "public", fileName), "utf8")
  );

const loadArchivedData = async (year: number): Promise<DataForMap> => {
  const [municipalities, polygons]: [Municipality[], PolygonMap] =
    await Promise.all([
      readPublicJson(`praha${year}.json`),
      readPublicJson(`praha-polygons${year}.json`),
    ]);
  return { municipalities: municipalities ?? [], polygons };
};

export const getAllData = (year?: number): Promise<DataForMap> =>
  loadData(year);

export const getMunicipalitySlugsList = async (
  year?: number
): Promise<
  {
    name: string;
    slug: string;
  }[]
> => {
  const { municipalities } = await loadData(year);

  return municipalities
    .map((municipality) => ({
      name: municipality.municipalityName,
      slug: slug(municipality.municipalityName),
    }))
    .sort((a, b) => pragueDistrictSortingFuction(a.name, b.name));
};

export const getSchoolSlugsList = async (year?: number): Promise<string[]> => {
  const { municipalities } = await loadData(year);

  return municipalities.flatMap((municipality) =>
    municipality.areas.flatMap((area) =>
      area.schools.map((school) => slug(school.name))
    )
  );
};

/**
 * School URLs are embedded on school websites, so a school renamed since the
 * previous year needs an entry in src/config/school-redirects.json. Fails the
 * build when one is missing.
 */
export const checkSchoolRedirects = async () => {
  const slugsByIzo = async (year: number) => {
    const { municipalities } = await loadData(year);
    return new Map(
      municipalities.flatMap((municipality) =>
        municipality.areas.flatMap((area) =>
          area.schools.map((school) => [school.izo, slug(school.name)] as const)
        )
      )
    );
  };
  const [previous, current] = await Promise.all([
    slugsByIzo(CURRENT_YEAR - 1),
    slugsByIzo(CURRENT_YEAR),
  ]);
  const redirects: Record<string, string> = Object.assign(
    {},
    ...Object.entries(schoolRedirects)
      .filter(([year]) => Number(year) <= CURRENT_YEAR)
      .map(([, redirects]) => redirects)
  );

  const missing = Array.from(previous)
    .filter(
      ([izo, oldSlug]) =>
        current.has(izo) &&
        current.get(izo) !== oldSlug &&
        redirects[oldSlug] !== current.get(izo)
    )
    .map(([izo, oldSlug]) => `"${oldSlug}": "${current.get(izo)}"`);
  if (missing.length > 0) {
    throw new Error(
      `Renamed schools need redirects under "${CURRENT_YEAR}" in src/config/school-redirects.json:\n${missing.join(",\n")}`
    );
  }
};

export const getSchoolSlugsMap = async (
  year?: number
): Promise<SchoolSlugs> => {
  const { municipalities } = await loadData(year);

  return [...municipalities]
    .sort((a, b) =>
      pragueDistrictSortingFuction(a.municipalityName, b.municipalityName)
    )
    .map((municipality) => ({
      municipalityName: municipality.municipalityName,
      schools: municipality.areas.flatMap((area) =>
        area.schools.map((school) => ({
          name: school.name,
          slug: slug(school.name),
        }))
      ),
    }));
};

/**
 * The Street Markdown text that lineNumbers in the data point into. Null when
 * the source doesn't publish it.
 */
export const getOrdinanceText = async (
  year = CURRENT_YEAR
): Promise<string | null> => {
  if (year === SOURCE_YEAR) {
    return (await getSourceData()).ordinanceText;
  }
  return fs.readFile(
    path.join(process.cwd(), "public", `vyhlaska_praha${year}.txt`),
    "utf8"
  );
};

export const getMunicipalityData = async (
  municipalitySlug: string,
  year?: number
): Promise<DataForMap | undefined> => {
  const { municipalities, polygons } = await loadData(year);

  const municipality = municipalities.find(
    (municipality) => municipalitySlug === slug(municipality.municipalityName)
  );
  if (!municipality) {
    return undefined;
  }

  return {
    municipalities: [municipality],
    polygons: {
      [municipality.code]: polygons[municipality.code],
    },
  };
};

export const getSchoolData = async (
  schoolSlug: string,
  year?: number
): Promise<DataForMap | undefined> => {
  const { municipalities, polygons } = await loadData(year);

  for (const municipality of municipalities) {
    for (const area of municipality.areas) {
      const school = area.schools.find(
        (school) => schoolSlug === slug(school.name)
      );
      if (school) {
        const schoolPolygon = polygons[municipality.code]?.features.find(
          (feature) => feature.properties?.schoolIzos.includes(school.izo)
        );
        return {
          municipalities: [
            {
              ...municipality,
              areas: [
                {
                  ...area,
                  schools: [school],
                },
              ],
            },
          ],
          polygons: {
            [municipality.code]: {
              type: "FeatureCollection",
              features: schoolPolygon ? [schoolPolygon] : [],
            },
          },
        };
      }
    }
  }
  return undefined;
};

const pragueDistrictSortingFuction = (a: string, b: string) => {
  if (a.includes("Městská část Praha ") && a.length < b.length) {
    return -1;
  } else if (b.includes("Městská část Praha ") && a.length > b.length) {
    return 1;
  }
  return a.localeCompare(b);
};
