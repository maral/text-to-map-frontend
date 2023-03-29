import { GetStaticProps } from "next";
import { Municipality } from "@/types/data";
import { getAllData } from "@/utils/dataCache";
import MapPage from "@/components/MapPage/MapPage";

export default function IndexPage({ municipalities }: MunicipalityPageProps) {
  return <MapPage municipalities={municipalities} />;
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
