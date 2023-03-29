import { GetStaticProps } from "next";
import { Municipality } from "@/types/data";
import { getAllData } from "@/utils/dataCache";
import MapPage from "@/components/MapPage/MapPage";
import { PageType } from "@/types/page";

export default function IndexPage({ municipalities }: MunicipalityPageProps) {
  return <MapPage municipalities={municipalities} pageType={PageType.All} />;
}

interface MunicipalityPageProps {
  municipalities: Municipality[];
}

export const getStaticProps: GetStaticProps<
  MunicipalityPageProps
> = async () => {
  const municipalities: Municipality[] = getAllData();

  return {
    props: {
      municipalities,
    },
  };
};
