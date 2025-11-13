import React from "react";
import styles from "./SidebarFilters.module.scss";

export const SidebarFilters: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Категория</h2>
        <div className={styles.chips}>
          <button type="button" className={`${styles.chip} ${styles.chipActive}`}>
            Техника
          </button>
          <button type="button" className={styles.chip}>
            Мебель
          </button>
          <button type="button" className={styles.chip}>
            Недвижимость
          </button>
          <button type="button" className={styles.chip}>
            Услуги
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Цена, ₽</h2>
        <div className={styles.priceRange}>
          <input type="number" className={styles.priceInput} placeholder="от" />
          <span className={styles.priceSeparator}>—</span>
          <input type="number" className={styles.priceInput} placeholder="до" />
        </div>
        <label className={styles.checkbox}>
          <input type="checkbox" />
          <span>Только с ценой</span>
        </label>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Расположение</h2>
        <input
          type="text"
          className={styles.locationInput}
          placeholder="Город или метро"
        />
        <label className={styles.checkbox}>
          <input type="checkbox" />
          <span>Только рядом со мной</span>
        </label>
      </div>

      <button type="button" className={styles.resetButton}>
        Сбросить фильтры
      </button>
    </aside>
  );
};
