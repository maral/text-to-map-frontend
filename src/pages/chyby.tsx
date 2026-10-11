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
    <MapPage data={data} showDebugInfo={true} ordinanceText={ordinanceText ?? undefined} />
  );
}

interface MunicipalityPageProps {
  data: DataForMap;
  ordinanceText: string | null;
}

export const getStaticProps: GetStaticProps<
  MunicipalityPageProps
> = async () => {
  const { municipalities, polygons } = await getAllData();
  const ordinanceText = await getOrdinanceText();

  return {
    props: {
      data: { municipalities, polygons },
      ordinanceText,
    },
  };
};
