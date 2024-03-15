import { Municipality } from "@/types/data";
import { PageType } from "@/types/page";
import { getAllData, getOrdinanceText } from "@/utils/dataCache";
import { GetStaticProps } from "next";
import NewMapPage from "../components/NewMap/NewMapPage";

export default function IndexPage({
  municipalities,
  ordinanceText,
}: MunicipalityPageProps) {
  return (
    <NewMapPage
      municipalities={municipalities}
      showDebugInfo={false}
      pageType={PageType.All}
      ordinanceText={ordinanceText}
    />
  );
}

interface MunicipalityPageProps {
  municipalities: Municipality[];
  ordinanceText: string;
}

export const getStaticProps: GetStaticProps<
  MunicipalityPageProps
> = async () => {
  const municipalities: Municipality[] = getAllData();
  const ordinanceText = getOrdinanceText();

  return {
    props: {
      municipalities,
      ordinanceText,
    },
  };
};
