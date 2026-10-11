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

  const municipalitySlug = context.params.municipality as string;
  const data = await getMunicipalityData(municipalitySlug);
  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      data,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const municipalites = await getMunicipalitySlugsList();

  const paths = municipalites.map(({ slug }) => ({
    params: { municipality: slug },
  }));

  return { paths, fallback: false };
};
