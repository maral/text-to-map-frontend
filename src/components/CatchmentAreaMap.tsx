import { Municipality } from "@/types/data";
import "leaflet/dist/leaflet.css";
import styles from "@/styles/CatchmentAreaMap.module.css";
import { memo, RefObject, useEffect, useRef } from "react";
import { createMap, loadMapyCzSuggest } from "@/scripts/createMap";
import Script from "next/script";

interface CatchmentAreaMapProps {
  municipalities: Municipality[];
  center: [number, number];
  zoom: number;
  suggestInput: RefObject<HTMLInputElement>;
  onError?: (message: string) => void;
}

const CatchmentAreaMap = memo(
  ({
    municipalities,
    center,
    zoom,
    suggestInput,
    onError,
  }: CatchmentAreaMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      console.log("useEffect createMap");
      if (mapRef.current) {
        createMap(mapRef.current, municipalities, center, zoom);
      }
    }, [municipalities, center, zoom]);
    useEffect(() => {
      console.log(suggestInput);
    }, [suggestInput]);
    return (
      <>
        <div ref={mapRef} className={styles.map} />
        <Script
          src="https://api.mapy.cz/loader.js"
          onLoad={() => {
            // @ts-ignore
            Loader.async = true;
            // @ts-ignore
            Loader.load(null, { suggest: true }, () => {
              console.log("Mapy.cz loaded");
              console.log("suggestInput", suggestInput);
              console.log("onError", onError);
              if (suggestInput.current && onError) {
                loadMapyCzSuggest(suggestInput.current, onError);
              }
            });
          }}
        />
      </>
    );
  },
  (prevProps: CatchmentAreaMapProps, nextProps: CatchmentAreaMapProps) => {
    console.log("CatchmentAreaMap memo", prevProps, nextProps);
    return (
      prevProps.municipalities === nextProps.municipalities &&
      prevProps.suggestInput === nextProps.suggestInput
    );
  }
);

CatchmentAreaMap.displayName = "CatchmentAreaMap";

export default CatchmentAreaMap;
