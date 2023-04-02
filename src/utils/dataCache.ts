import fs from "fs";
import path from "path";
import slug from "slug";
import { Municipality, SchoolSlugs } from "@/types/data";

let allData: Municipality[];

export const getAllData = (): Municipality[] => {
  if (allData) {
    return allData;
  }

  const filePath = path.join(process.cwd(), "data/praha.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  allData = JSON.parse(fileContents);
  if (!allData) {
    allData = [];
  }

  return allData;
};

export const getMunicipalitySlugsList = (): {
  name: string;
  slug: string;
}[] => {
  const allData = getAllData();

  return allData
    ? allData.map((municipality) => ({
        name: municipality.municipalityName,
        slug: slug(municipality.municipalityName),
      }))
    : [];
};

export const loadMunicipalityData = (
  municipalitySlug: string
): Municipality | undefined => {
  const allData = getAllData();

  return allData.find(
    (municipality) => municipalitySlug === slug(municipality.municipalityName)
  );
};

export const getSchoolSlugsList = (): string[] => {
  const allData = getAllData();

  return allData
    ? allData.flatMap((municipality) =>
        municipality.schools.map((school) => slug(school.name))
      )
    : [];
};

export const getSchoolSlugsMap = (): SchoolSlugs => {
  const allData = getAllData();

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
  schoolSlug: string
): Municipality | undefined => {
  const allData = getAllData();

  for (const municipality of allData) {
    const school = municipality.schools.find(
      (school) => schoolSlug === slug(school.name)
    );
    if (school) {
      return {
        municipalityName: municipality.municipalityName,
        schools: [school],
      };
    }
  }
  return undefined;
};
