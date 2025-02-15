import { DataForMap } from "@/types/data";
import { getAllData } from "@/utils/dataCache";
import { GetStaticProps } from "next";
import MapPage from "../components/MapPage/MapPage";

export default function IndexPage({ data }: MunicipalityPageProps) {
  return <MapPage data={data} showDebugInfo={false} />;
}

interface MunicipalityPageProps {
  data: DataForMap;
}

export const getStaticProps: GetStaticProps<MunicipalityPageProps> = () => {
  return {
    props: {
      data: getAllData(2024),
    },
  };
};
