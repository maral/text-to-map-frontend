import { DataForMap } from "@/types/data";
import {
  getAllData,
  getOrdinanceText
} from "@/utils/dataCache";
import { GetStaticProps } from "next";
import MapPage from "../components/MapPage/MapPage";

export default function IndexPage({
  data,
  ordinanceText,
}: MunicipalityPageProps) {
  return (
    <MapPage data={data} showDebugInfo={true} ordinanceText={ordinanceText} />
  );
}

interface MunicipalityPageProps {
  data: DataForMap;
  ordinanceText: string;
}

export const getStaticProps: GetStaticProps<
  MunicipalityPageProps
> = async () => {
  const { municipalities, polygons } = getAllData();
  const ordinanceText = getOrdinanceText();

  return {
    props: {
      data: { municipalities, polygons },
      ordinanceText,
    },
  };
};
