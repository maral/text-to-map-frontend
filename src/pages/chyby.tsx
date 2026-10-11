import { DataForMap, DeferredAddresses } from "@/types/data";
import {
  getDataWithDeferredAddresses,
  getOrdinanceText,
} from "@/utils/dataCache";
import { GetStaticProps } from "next";
import MapPage from "../components/MapPage/MapPage";

export default function IndexPage({
  data,
  deferredAddresses,
  ordinanceText,
}: MunicipalityPageProps) {
  return (
    <MapPage
      data={data}
      showDebugInfo={true}
      ordinanceText={ordinanceText ?? undefined}
      deferredAddresses={deferredAddresses}
    />
  );
}

interface MunicipalityPageProps {
  data: DataForMap;
  deferredAddresses: DeferredAddresses;
  ordinanceText: string | null;
}

export const getStaticProps: GetStaticProps<
  MunicipalityPageProps
> = async () => {
  const [{ data, deferredAddresses }, ordinanceText] = await Promise.all([
    getDataWithDeferredAddresses(),
    getOrdinanceText(),
  ]);

  return {
    props: {
      data,
      deferredAddresses,
      ordinanceText,
    },
  };
};
