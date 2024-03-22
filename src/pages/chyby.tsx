import { DataForMap, Municipality } from "@/types/data";
import { PageType } from "@/types/page";
import { getAllData, getOrdinanceText, getPolygons } from "@/utils/dataCache";
import { GetStaticProps } from "next";
import NewMapPage from "../components/NewMap/NewMapPage";

export default function IndexPage({
  data,
  ordinanceText,
}: MunicipalityPageProps) {
  return (
    <NewMapPage
      data={data}
      showDebugInfo={true}
      pageType={PageType.All}
      ordinanceText={ordinanceText}
    />
  );
}

interface MunicipalityPageProps {
  data: DataForMap;
  ordinanceText: string;
}

export const getStaticProps: GetStaticProps<
  MunicipalityPageProps
> = async () => {
  const municipalities: Municipality[] = getAllData();
  const polygons = getPolygons();
  const ordinanceText = getOrdinanceText();

  return {
    props: {
      data: { municipalities, polygons },
      ordinanceText,
    },
  };
};
