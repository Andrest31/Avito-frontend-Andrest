import React, { useEffect, useState } from "react";
import styles from "./Header.module.scss";
import { Link, useLocation } from "react-router-dom";
import { useSearch } from "../search/SearchContext";
import { useTheme } from "../theme/ThemeContext";

interface Moderator {
  id: number;
  name: string;
  role: string;
}

export const Header: React.FC = () => {
  const location = useLocation();
  const isStatsPage = location.pathname === "/stats";

  const { query, setQuery } = useSearch();
  const { theme, toggleTheme } = useTheme();
  const [moderator, setModerator] = useState<Moderator | null>(null);

  useEffect(() => {
    const fetchModerator = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/v1/moderators/me"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Moderator = await response.json();
        setModerator(data);
      } catch (error) {
        console.error("Error fetching moderator:", error);
      }
    };

    fetchModerator();
  }, []);

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
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"
          }
        >
          <svg
            viewBox="0 0 24 24"
            className={styles.themeIcon}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4.5" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
          </svg>
        </button>

        <Link
          to="/stats"
          className={`${styles.statsButton} ${
            isStatsPage ? styles.statsButtonActive : ""
          } ${isStatsPage ? styles.statsButtonDisabled : ""}`}
        >
          Статистика
        </Link>

        <div className={styles.headerProfile}>
          {moderator ? (
            <>
              <span className={styles.profileAvatar}>
                {moderator.name.charAt(0)}
              </span>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{moderator?.name}</span>
                <span className={styles.profileRole}>{moderator?.role}</span>
              </div>
            </>
          ) : (
            <>
              <span className={styles.profileAvatar}>З</span>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>Загрузка</span>
                <span className={styles.profileRole}>Загрузка</span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
