import useQueryParams from "@/hooks/useQueryParams";
import "leaflet/dist/leaflet.css";
import styles from "@/styles/MapPage.module.css";
import { DataForMap } from "@/types/data";
import { useEffect, useRef, useState } from "react";
import Alert from "../MapPage/Alert";
import Menu from "../MapPage/Menu";
import { SearchInput } from "../MapPage/SearchInput";
import { createMap } from "./createMap";
import { SuggestionItem } from "../../types/suggestionTypes";

interface InnerMapProps {
  data: DataForMap;
  showDebugInfo: boolean;
  text?: string;
  year?: number;
}

const InnerMap = ({ data, text, showDebugInfo, year }: InnerMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef(false);
  const { center, zoom, isReady, showControls, showSearch, showMenu, color } =
    useQueryParams();

  const [alertMessage, setAlertMessage] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 5000);
  };

  const [onSelect, setOnSelect] = useState<(item: SuggestionItem) => void>(
    () => () => {}
  );

  useEffect(() => {
    if (mapRef.current && isReady && mapInitialized.current === false) {
      const { onSuggestionSelect } = createMap(
        mapRef.current,
        data,
        showDebugInfo,
        showAlert,
        text,
        center,
        zoom,
        color,
        showControls
      );

      if (onSuggestionSelect) {
        setOnSelect(() => onSuggestionSelect);
      }
      mapInitialized.current = true;
    }
  }, [
    data,
    text,
    mapRef,
    center,
    zoom,
    color,
    showControls,
    isReady,
    showDebugInfo,
  ]);

  return (
    <>
      {showSearch && (
        <div
          className={`${styles.suggest} ${
            showControls ? styles.moveRight : ""
          }`}
        >
          <SearchInput onSelect={onSelect} />
        </div>
      )}
      <div ref={mapRef} className={styles.map} />;
      {showMenu && (
        <Menu
          moveLeft={data.municipalities.length > 1 && showControls}
          year={year}
        />
      )}
      <Alert message={alertMessage} visible={alertVisible} />
    </>
  );
};

InnerMap.displayName = "InnerMap";

export default InnerMap;
