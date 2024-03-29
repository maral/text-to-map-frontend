import { DataForMap } from "@/types/data";
import "leaflet/dist/leaflet.css";
import styles from "@/styles/CatchmentAreaMap.module.css";
import { RefObject, useEffect, useRef } from "react";
import { createMap, loadMapyCzSuggest } from "./createMap";
import Script from "next/script";
import useQueryParams from "@/hooks/useQueryParams";

interface InnerMapProps {
  data: DataForMap;
  showDebugInfo: boolean;
  text?: string;
  suggestInput?: RefObject<HTMLInputElement>;
  onError?: (message: string) => void;
}

const InnerMap = ({
  data,
  text,
  showDebugInfo,
  suggestInput,
  onError,
}: InnerMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { center, zoom, isReady, showControls, color } = useQueryParams();

  useEffect(() => {
    if (mapRef.current && isReady) {
      createMap(
        mapRef.current,
        data,
        showDebugInfo,
        text,
        center,
        zoom,
        color,
        showControls
      );
    }
  }, [data, text, mapRef, center, zoom, showControls, isReady, showDebugInfo]);

  return (
    <>
      <div ref={mapRef} className={styles.map} />
      {suggestInput && (
        <Script
          src="https://api.mapy.cz/loader.js"
          onLoad={() => {
            // @ts-ignore
            Loader.async = true;
            // @ts-ignore
            Loader.load(null, { suggest: true }, () => {
              if (suggestInput.current && onError) {
                loadMapyCzSuggest(suggestInput.current, onError);
              }
            });
          }}
        />
      )}
    </>
  );
};

InnerMap.displayName = "InnerMap";

export default InnerMap;
