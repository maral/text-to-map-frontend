import MapPage from "@/components/MapPage/MapPage";
import {
  getMunicipalitySlugsList,
  loadMunicipalityData,
} from "@/utils/dataCache";
import { GetStaticProps, GetStaticPaths } from "next";
import { Municipality } from "@/types/data";

export default ({ municipalities }: MunicipalityPageProps) => {
  return <MapPage municipalities={municipalities} />;
};

interface MunicipalityPageProps {
  municipalities: Municipality[];
}

export const getStaticProps: GetStaticProps<MunicipalityPageProps> = async (
  context
) => {
  console.log("[municipality]");
  if (!context.params) {
    return {
      notFound: true,
    };
  }

  const municipalityId = context.params.municipality as string;
  const municipality = loadMunicipalityData(municipalityId);

  if (!municipality) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      municipalities: [municipality],
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const municipalites = getMunicipalitySlugsList();

  const paths = municipalites.map((municipality: string) => ({
    params: { municipality },
  }));

  return { paths, fallback: false };
};
