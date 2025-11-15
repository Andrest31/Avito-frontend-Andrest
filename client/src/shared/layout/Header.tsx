import React from "react";
import styles from "./Header.module.scss";
import { Link, useLocation } from "react-router-dom";
import { useSearch } from "../search/SearchContext";

export const Header: React.FC = () => {
  const location = useLocation();
  const isStatsPage = location.pathname === "/stats";

  const { query, setQuery } = useSearch();

  return (
    <header className={styles.header}>
      <Link to="/list" className={styles.headerLeft}>
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
          <span className={styles.searchIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path
                d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.49 21.49 20 15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                fill="currentColor"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Поиск по объявлениям"
            className={styles.searchField}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.headerRight}>
        <Link
          to="/stats"
          className={`${styles.statsButton} ${
            isStatsPage ? styles.statsButtonActive : ""
          }`}
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
