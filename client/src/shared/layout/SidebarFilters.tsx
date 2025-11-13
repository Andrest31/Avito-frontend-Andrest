import React from "react";
import styles from "./SidebarFilters.module.scss";

export const SidebarFilters: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      {/* Статус модерации — множественный выбор по ТЗ */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Статус</h2>
        <label className={styles.checkbox}>
          <input type="checkbox" defaultChecked />
          <span>На модерации</span>
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" />
          <span>Одобрено</span>
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" />
          <span>Отклонено</span>
        </label>
      </div>

      {/* Категория объявлений */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Категория</h2>
        <div className={styles.chips}>
          <button
            type="button"
            className={`${styles.chip} ${styles.chipActive}`}
          >
            Электроника
          </button>
          <button type="button" className={styles.chip}>
            Мебель
          </button>
          <button type="button" className={styles.chip}>
            Одежда
          </button>
          <button type="button" className={styles.chip}>
            Услуги
          </button>
        </div>
      </div>

      {/* Приоритет */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Приоритет</h2>
        <label className={styles.checkbox}>
          <input type="checkbox" defaultChecked />
          <span>Обычные</span>
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" defaultChecked />
          <span>Срочные</span>
        </label>
      </div>

      {/* Диапазон цен */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Цена, ₽</h2>
        <div className={styles.priceRange}>
          <input type="number" className={styles.priceInput} placeholder="от" />
          <span className={styles.priceSeparator}>—</span>
          <input type="number" className={styles.priceInput} placeholder="до" />
        </div>
        <label className={styles.checkbox}>
          <input type="checkbox" />
          <span>Только с указанной ценой</span>
        </label>
      </div>

      <button type="button" className={styles.resetButton}>
        Сбросить фильтры
      </button>
    </aside>
  );
};
