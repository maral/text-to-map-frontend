import { DataForMap } from "@/types/data";
import {
  getMunicipalityData,
  getMunicipalitySlugsList,
} from "@/utils/dataCache";
import { GetStaticPaths, GetStaticProps } from "next";
import MapPage from "../../components/MapPage/MapPage";

const MunicipalityPage = ({ data }: MunicipalityPageProps) => {
  return <MapPage data={data} />;
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
