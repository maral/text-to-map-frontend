import fs from "fs";
import path from "path";
import slug from "slug";
import {
  DataForMap,
  Municipality,
  PolygonMap,
  SchoolSlugs,
} from "@/types/data";

let allData: Municipality[];

const CURRENT_YEAR = 2025;

export const getAllMunicipalities = (year = CURRENT_YEAR): Municipality[] => {
  if (allData) {
    return allData;
  }

  const filePath = path.join(process.cwd(), `public/praha${year}.json`);
  const fileContents = fs.readFileSync(filePath, "utf8");
  allData = JSON.parse(fileContents);
  if (!allData) {
    allData = [];
  }

  return allData;
};

export const getMunicipalitySlugsList = (
  year = CURRENT_YEAR
): {
  name: string;
  slug: string;
}[] => {
  const allData = getAllMunicipalities(year);

  return allData
    ? allData.map((municipality) => ({
        name: municipality.municipalityName,
        slug: slug(municipality.municipalityName),
      }))
    : [];
};

export const loadMunicipalityData = (
  municipalitySlug: string,
  year = CURRENT_YEAR
): Municipality | undefined => {
  const allData = getAllMunicipalities(year);

  return allData.find(
    (municipality) => municipalitySlug === slug(municipality.municipalityName)
  );
};

export const getSchoolSlugsList = (year = CURRENT_YEAR): string[] => {
  const allData = getAllMunicipalities(year);

  return allData
    ? allData.flatMap((municipality) =>
        municipality.areas.flatMap((area) =>
          area.schools.map((school) => slug(school.name))
        )
      )
    : [];
};

export const getSchoolSlugsMap = (year = CURRENT_YEAR): SchoolSlugs => {
  const allData = getAllMunicipalities(year);

  return allData
    ? allData.map((municipality) => ({
        municipalityName: municipality.municipalityName,
        schools: municipality.areas.flatMap((area) =>
          area.schools.map((school) => ({
            name: school.name,
            slug: slug(school.name),
          }))
        ),
      }))
    : [];
};

export const loadSchoolData = (
  schoolSlug: string,
  year = CURRENT_YEAR
): Municipality => {
  const allData = getAllMunicipalities(year);

  for (const municipality of allData) {
    for (const area of municipality.areas) {
      const school = area.schools.find(
        (school) => schoolSlug === slug(school.name)
      );
      if (school) {
        return {
          ...municipality,
          areas: [
            {
              ...area,
              schools: [school],
            },
          ],
        };
      }
    }
  }
  throw new Error(`School ${schoolSlug} not found`);
};

export const getOrdinanceText = (year = CURRENT_YEAR): string => {
  return fs.readFileSync(`public/vyhlaska_praha${year}.txt`, "utf8");
};

export const getPolygons = (year = CURRENT_YEAR): PolygonMap => {
  const filePath = path.join(
    process.cwd(),
    `public/praha-polygons${year}.json`
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents);
};

export const getAllData = (year = CURRENT_YEAR): DataForMap => {
  return {
    municipalities: getAllMunicipalities(year),
    polygons: getPolygons(year),
  };
};

export const getMunicipalityData = (
  municipalitySlug: string,
  year = CURRENT_YEAR
): DataForMap => {
  const schoolMunicipality = loadMunicipalityData(municipalitySlug, year);
  const municipalityCode = getMunicipalityCodeBySlug(municipalitySlug, year);
  const polygons = getPolygons(year);

  return {
    municipalities: schoolMunicipality ? [schoolMunicipality] : [],
    polygons: {
      [municipalityCode]: polygons[municipalityCode],
    },
  };
};

export const getSchoolData = (
  schoolSlug: string,
  year = CURRENT_YEAR
): DataForMap => {
  const schoolMunicipality = loadSchoolData(schoolSlug, year);
  const { schoolIzo, municipalityCode } = getCodesBySchoolSlug(
    schoolSlug,
    year
  );
  const polygons = getPolygons(year);

  const schoolPolygon = polygons[municipalityCode].features.find(
    (feature) => feature.properties?.schoolIzo === schoolIzo
  );

  return {
    municipalities: schoolMunicipality ? [schoolMunicipality] : [],
    polygons: {
      [municipalityCode]: {
        type: "FeatureCollection",
        features: schoolPolygon ? [schoolPolygon] : [],
      },
    },
  };
};

const getMunicipalityCodeBySlug = (
  municipalitySlug: string,
  year = CURRENT_YEAR
): number => {
  const allData = getAllMunicipalities(year);

  const municipality = allData.find(
    (municipality) => municipalitySlug === slug(municipality.municipalityName)
  );
  if (municipality) {
    return municipality.code;
  }
  throw new Error(`Municipality ${municipalitySlug} not found`);
};

const getCodesBySchoolSlug = (
  schoolSlug: string,
  year = CURRENT_YEAR
): { schoolIzo: string; municipalityCode: number } => {
  const allData = getAllMunicipalities(year);

  for (const municipality of allData) {
    for (const area of municipality.areas) {
      const school = area.schools.find(
        (school) => schoolSlug === slug(school.name)
      );
      if (school) {
        return { schoolIzo: school.izo, municipalityCode: municipality.code };
      }
    }
  }
  throw new Error(`School ${schoolSlug} not found`);
};
