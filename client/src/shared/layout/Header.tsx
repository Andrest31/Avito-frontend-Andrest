import React from "react";
import styles from "./Header.module.scss";
import { Link, useLocation } from "react-router-dom";

export const Header: React.FC = () => {
  const location = useLocation();

  const isStatsPage = location.pathname === "/stats";

  return (
    <header className={styles.header}>
      <Link
        to="/list"
        className={`${styles.headerLeft}`}
      >
        <div className={styles.logoBadge}>
          <span className={`${styles.logoDot} ${styles.logoDotBlue}`} />
          <span className={`${styles.logoDot} ${styles.logoDotGreen}`} />
          <span className={`${styles.logoDot} ${styles.logoDotRed}`} />
        </div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>Avito Intern</span>
          <span className={styles.logoSubtitle}>Frontend trainee 2025</span>
        </div>
      </Link>

      <div className={styles.headerCenter}>
        <div className={styles.searchInput}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Поиск по объявлениям"
            className={styles.searchField}
          />
        </div>
      </div>

      <div className={styles.headerRight}>
        <Link
          to="/stats"
          className={`${styles.statsButton} ${isStatsPage ? styles.statsButtonActive : ""}`}
        >
          Статистика
        </Link>
        <div className={styles.headerProfile}>
          <span className={styles.profileAvatar}>У</span>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>Уважаемый</span>
            <span className={styles.profileRole}>стажер</span>
          </div>
        </div>
      </div>
    </header>
  );
};
