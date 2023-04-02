import { Municipality } from "@/types/data";
import "leaflet/dist/leaflet.css";
import styles from "@/styles/CatchmentAreaMap.module.css";
import { memo, RefObject, useEffect, useRef } from "react";
import { createMap, loadMapyCzSuggest } from "@/scripts/createMap";
import Script from "next/script";
import useQueryParams from "@/hooks/useQueryParams";

interface CatchmentAreaMapProps {
  municipalities: Municipality[];
  suggestInput?: RefObject<HTMLInputElement>;
  onError?: (message: string) => void;
}

const CatchmentAreaMap = memo(
  ({ municipalities, suggestInput, onError }: CatchmentAreaMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const { center, zoom, isReady, showControls, color } = useQueryParams();

    useEffect(() => {
      if (mapRef.current && isReady) {
        createMap(
          mapRef.current,
          municipalities,
          center,
          zoom,
          showControls,
          color
        );
      }
    }, [municipalities, center, zoom, showControls, color, isReady]);

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
  },
  (prevProps: CatchmentAreaMapProps, nextProps: CatchmentAreaMapProps) => {
    return (
      prevProps.municipalities === nextProps.municipalities &&
      prevProps.suggestInput === nextProps.suggestInput
    );
  }
);

CatchmentAreaMap.displayName = "CatchmentAreaMap";

export default CatchmentAreaMap;
