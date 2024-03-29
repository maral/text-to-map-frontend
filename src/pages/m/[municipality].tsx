import MapPage from "@/components/OldMap/MapPage";
import {
  getMunicipalityData,
  getMunicipalitySlugsList,
  loadMunicipalityData,
} from "@/utils/dataCache";
import { GetStaticProps, GetStaticPaths } from "next";
import { DataForMap, Municipality } from "@/types/data";
import { PageType } from "@/types/page";
import NewMapPage from "../../components/NewMap/NewMapPage";

const MunicipalityPage = ({ data }: MunicipalityPageProps) => {
  return <NewMapPage data={data} pageType={PageType.Municipality} />;
};
MunicipalityPage.displayName = "[municipality]";

export default MunicipalityPage;

interface MunicipalityPageProps {
  data: DataForMap;
}

export const getStaticProps: GetStaticProps<MunicipalityPageProps> = async (
  context
) => {
  if (!context.params) {
    return {
      notFound: true,
    };
  }

  try {
    const municipalitySlug = context.params.municipality as string;
    return {
      props: {
        data: getMunicipalityData(municipalitySlug),
      },
    };
  } catch (e) {
    return {
      notFound: true,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  const municipalites = getMunicipalitySlugsList();

  const paths = municipalites.map(({ slug }) => ({
    params: { municipality: slug },
  }));

  return { paths, fallback: false };
};
