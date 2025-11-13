import React from "react";
import styles from "./Header.module.scss";

export const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.logoBadge}>
          <span className={`${styles.logoDot} ${styles.logoDotBlue}`} />
          <span className={`${styles.logoDot} ${styles.logoDotGreen}`} />
          <span className={`${styles.logoDot} ${styles.logoDotRed}`} />
        </div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>Avito Intern</span>
          <span className={styles.logoSubtitle}>Frontend trainee 2025</span>
        </div>
      </div>

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
        <button
          type="button"
          className={`${styles.headerButton} ${styles.headerButtonSecondary}`}
        >
          Мои фильтры
        </button>
        <button
          type="button"
          className={`${styles.headerButton} ${styles.headerButtonPrimary}`}
        >
          Разместить объявление
        </button>
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
