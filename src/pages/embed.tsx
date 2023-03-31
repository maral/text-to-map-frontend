import { GetStaticProps } from "next";
import { Municipality } from "@/types/data";
import {
  getAllData,
  getMunicipalitySlugsList,
  getSchoolSlugsList,
} from "@/utils/dataCache";
import MapPage from "@/components/MapPage/MapPage";
import { PageType } from "@/types/page";

export default function EmbedPage({
  schoolSlugs,
  municipalitySlugs,
}: MunicipalityPageProps) {
  return <></>;
}

interface MunicipalityPageProps {
  schoolSlugs: string[];
  municipalitySlugs: string[];
}

export const getStaticProps: GetStaticProps<
  MunicipalityPageProps
> = async () => {
  const schoolSlugs = getSchoolSlugsList();
  const municipalitySlugs = getMunicipalitySlugsList();

  return {
    props: {
      schoolSlugs,
      municipalitySlugs,
    },
  };
};
