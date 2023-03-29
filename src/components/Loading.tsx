import styles from "@/styles/Loading.module.css";

const Loading = () => (
  <div className={styles.middle}>
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className={`${styles.bar} ${styles["bar" + i]}`} />
    ))}
  </div>
);

export default Loading;
