import React, { type ChangeEvent } from "react";
import styles from "./SidebarFilters.module.scss";
import type { ModerationStatus, Priority } from "../listing/ListingCard";
import type { ModerationDecision } from "../listing/moderationDecision";

const ALL_CATEGORIES = ["Электроника", "Услуги", "Детское", "Мода", "Недвижимость"];

export type Filters = {
  statuses: ModerationStatus[];
  categories: string[];
  priorities: Priority[];
  priceFrom?: number;
  priceTo?: number;
  onlyWithPrice: boolean;
};

type Props = {
  value: Filters;
  onChange: (next: Filters) => void;
  isSelectionMode: boolean;
  onToggleSelection: () => void;
  onBulkDecision: (d: ModerationDecision) => void;
};

export const SidebarFilters: React.FC<Props> = ({
  value,
  onChange,
  isSelectionMode,
  onToggleSelection,
  onBulkDecision,
}) => {
  const toggleInArray = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const handleStatusChange = (status: ModerationStatus) => {
    onChange({ ...value, statuses: toggleInArray(value.statuses, status) });
  };

  const handlePriorityChange = (priority: Priority) => {
    onChange({
      ...value,
      priorities: toggleInArray(value.priorities, priority),
    });
  };

  const handleCategoryClick = (category: string) => {
    onChange({
      ...value,
      categories: toggleInArray(value.categories, category),
    });
  };

  const handlePriceChange =
    (field: "priceFrom" | "priceTo") =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.trim();
      const num = raw === "" ? undefined : Number(raw);
      onChange({
        ...value,
        [field]: Number.isFinite(num as number) ? num : undefined,
      });
    };

  const handleOnlyWithPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      onlyWithPrice: e.target.checked,
    });
  };

  const handleReset = () => {
    onChange({
      statuses: ["pending", "approved", "rejected"],
      categories: [],
      priorities: ["normal", "urgent"],
      priceFrom: undefined,
      priceTo: undefined,
      onlyWithPrice: false,
    });
  };

  return (
    <div className={styles.filtersWrapper}>
      <div className={styles.filtersBar}>
        <div className={styles.block}>
          <div className={styles.blockTitle}>Статус</div>
          <div className={styles.checkboxRow}>
            <label>
              <input
                type="checkbox"
                checked={value.statuses.includes("pending")}
                onChange={() => handleStatusChange("pending")}
              />
              <span>На модерации</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={value.statuses.includes("approved")}
                onChange={() => handleStatusChange("approved")}
              />
              <span>Одобрено</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={value.statuses.includes("rejected")}
                onChange={() => handleStatusChange("rejected")}
              />
              <span>Отклонено</span>
            </label>
          </div>
        </div>

        <div className={styles.block}>
          <div className={styles.blockTitle}>Категория</div>
          <div className={styles.chips}>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.chip} ${
                  value.categories.includes(cat) ? styles.chipActive : ""
                }`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.block}>
          <div className={styles.blockTitle}>Приоритет</div>
          <div className={styles.checkboxRow}>
            <label>
              <input
                type="checkbox"
                checked={value.priorities.includes("normal")}
                onChange={() => handlePriorityChange("normal")}
              />
              <span>Обычные</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={value.priorities.includes("urgent")}
                onChange={() => handlePriorityChange("urgent")}
              />
              <span>Срочные</span>
            </label>
          </div>
        </div>

        <div className={styles.block}>
          <div className={styles.blockTitle}>Цена, ₽</div>
          <div className={styles.priceRow}>
            <input
              type="number"
              className={styles.priceInput}
              placeholder="от"
              value={value.priceFrom ?? ""}
              onChange={handlePriceChange("priceFrom")}
            />
            <span className={styles.priceDash}>—</span>
            <input
              type="number"
              className={styles.priceInput}
              placeholder="до"
              value={value.priceTo ?? ""}
              onChange={handlePriceChange("priceTo")}
            />
          </div>
          <label className={styles.onlyPriceRow}>
            <input
              type="checkbox"
              checked={value.onlyWithPrice}
              onChange={handleOnlyWithPriceChange}
            />
            <span>Только с указанной ценой</span>
          </label>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.bottomLeft}>
          <button
            type="button"
            className={`${styles.selectButton} ${
              isSelectionMode ? styles.selectButtonActive : ""
            }`}
            onClick={onToggleSelection}
          >
            {isSelectionMode ? "Отменить выбор" : "Выбрать"}
          </button>

          {isSelectionMode && (
            <div className={styles.selectionActions}>
              <button
                type="button"
                className={`${styles.statusButton} ${styles.statusPending}`}
                onClick={() => onBulkDecision("returned")}
              >
                На модерации
              </button>
              <button
                type="button"
                className={`${styles.statusButton} ${styles.statusApproved}`}
                onClick={() => onBulkDecision("approved")}
              >
                Одобрить
              </button>
              <button
                type="button"
                className={`${styles.statusButton} ${styles.statusRejected}`}
                onClick={() => onBulkDecision("rejected")}
              >
                Отклонить
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className={styles.resetButton}
          onClick={handleReset}
        >
          Сбросить фильтры
        </button>
      </div>
    </div>
  );
};
