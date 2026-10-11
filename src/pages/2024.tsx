import { DataForMap, DeferredAddresses } from "@/types/data";
import { getDataWithDeferredAddresses } from "@/utils/dataCache";
import { GetStaticProps } from "next";
import MapPage from "../components/MapPage/MapPage";

export default function IndexPage({
  data,
  deferredAddresses,
}: MunicipalityPageProps) {
  return (
    <MapPage
      data={data}
      showDebugInfo={false}
      deferredAddresses={deferredAddresses}
    />
  );
}

interface MunicipalityPageProps {
  data: DataForMap;
  deferredAddresses: DeferredAddresses;
}

export const getStaticProps: GetStaticProps<
  MunicipalityPageProps
> = async () => {
  return {
    props: await getDataWithDeferredAddresses(2024),
  };
};
