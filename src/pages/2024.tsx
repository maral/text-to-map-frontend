import { DataForMap } from "@/types/data";
import { PageType } from "@/types/page";
import { getAllData } from "@/utils/dataCache";
import { GetStaticProps } from "next";
import NewMapPage from "../components/NewMap/NewMapPage";

export default function IndexPage({ data }: MunicipalityPageProps) {
  return (
    <NewMapPage data={data} showDebugInfo={false} pageType={PageType.All} />
  );
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
