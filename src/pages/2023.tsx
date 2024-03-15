import { GetStaticProps } from "next";
import { Municipality } from "@/types/data";
import { getAllData } from "@/utils/dataCache";
import MapPage from "@/components/OldMap/MapPage";
import { PageType } from "@/types/page";

export default function Year2023Page({ municipalities }: MunicipalityPageProps) {
  return <MapPage municipalities={municipalities} pageType={PageType.All} year={2023} />;
}

interface MunicipalityPageProps {
  municipalities: Municipality[];
}

export const getStaticProps: GetStaticProps<
  MunicipalityPageProps
> = async () => {
  const municipalities: Municipality[] = getAllData(2023);

  return {
    props: {
      municipalities,
    },
  };
};
