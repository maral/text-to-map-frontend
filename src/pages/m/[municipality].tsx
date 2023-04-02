import MapPage from "@/components/MapPage/MapPage";
import {
  getMunicipalitySlugsList,
  loadMunicipalityData,
} from "@/utils/dataCache";
import { GetStaticProps, GetStaticPaths } from "next";
import { Municipality } from "@/types/data";
import { PageType } from "@/types/page";

const MunicipalityPage = ({ municipalities }: MunicipalityPageProps) => {
  return (
    <MapPage municipalities={municipalities} pageType={PageType.Municipality} />
  );
};
MunicipalityPage.displayName = "[municipality]";

export default MunicipalityPage;

interface MunicipalityPageProps {
  municipalities: Municipality[];
}

export const getStaticProps: GetStaticProps<MunicipalityPageProps> = async (
  context
) => {
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

  const paths = municipalites.map(({ slug }) => ({
    params: { municipality: slug },
  }));

  return { paths, fallback: false };
};
