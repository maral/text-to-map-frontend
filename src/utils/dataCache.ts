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

export const getAllMunicipalities = (year = 2024): Municipality[] => {
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
  year = 2024
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
  year = 2024
): Municipality | undefined => {
  const allData = getAllMunicipalities(year);

  return allData.find(
    (municipality) => municipalitySlug === slug(municipality.municipalityName)
  );
};

export const getSchoolSlugsList = (year = 2024): string[] => {
  const allData = getAllMunicipalities(year);

  return allData
    ? allData.flatMap((municipality) =>
        municipality.schools.map((school) => slug(school.name))
      )
    : [];
};

export const getSchoolSlugsMap = (year = 2024): SchoolSlugs => {
  const allData = getAllMunicipalities(year);

  return allData
    ? allData.map((municipality) => ({
        municipalityName: municipality.municipalityName,
        schools: municipality.schools.map((school) => ({
          name: school.name,
          slug: slug(school.name),
        })),
      }))
    : [];
};

export const loadSchoolData = (
  schoolSlug: string,
  year = 2024
): Municipality => {
  const allData = getAllMunicipalities(year);

  for (const municipality of allData) {
    const school = municipality.schools.find(
      (school) => schoolSlug === slug(school.name)
    );
    if (school) {
      return {
        ...municipality,
        schools: [school],
      };
    }
  }
  throw new Error(`School ${schoolSlug} not found`);
};

export const getOrdinanceText = (): string => {
  return fs.readFileSync("public/vyhlaska_praha.txt", "utf8");
};

export const getPolygons = (year = 2024): PolygonMap => {
  const filePath = path.join(
    process.cwd(),
    `public/praha-polygons${year}.json`
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents);
};

export const getAllData = (year = 2024): DataForMap => {
  return {
    municipalities: getAllMunicipalities(year),
    polygons: getPolygons(year),
  };
};

export const getMunicipalityData = (
  municipalitySlug: string,
  year = 2024
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

export const getSchoolData = (schoolSlug: string, year = 2024): DataForMap => {
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
  year = 2024
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
  year = 2024
): { schoolIzo: string; municipalityCode: number } => {
  const allData = getAllMunicipalities(year);

  for (const municipality of allData) {
    const school = municipality.schools.find(
      (school) => schoolSlug === slug(school.name)
    );
    if (school) {
      return { schoolIzo: school.izo, municipalityCode: municipality.code };
    }
  }
  throw new Error(`School ${schoolSlug} not found`);
};
