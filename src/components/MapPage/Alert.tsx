import styles from "@/styles/MapPage.module.css";
import { useEffect, useRef } from "react";

export interface AlertProps {
  message: string;
  visible: boolean;
}

export default ({ message, visible }: AlertProps) => {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alertDiv = alertRef.current;
    if (!alertDiv) return;
    if (visible) {
      alertDiv.innerHTML = message;
      alertDiv.style.display = "block";
      alertDiv.style.opacity = "1";
    } else {
      alertDiv.style.opacity = "0";
      setTimeout(() => {
        alertDiv.style.display = "none";
      }, 500);
    }
  }, [visible]);
  return (
    <div
      ref={alertRef}
      className={`${styles.alert} alert alert-warning`}
      role="alert"
    >
      {message}
    </div>
  );
};
