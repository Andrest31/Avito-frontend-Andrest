import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../../shared/layout/Header";
import {
  ListingCard,
  type Listing,
  type ModerationStatus,
  type Priority,
} from "../../shared/listing/ListingCard";
import {
  SidebarFilters,
  type Filters,
} from "../../shared/layout/SidebarFilters";
import {
  getInitialListings,
  type ListingWithMeta,
} from "../../shared/listing/mockListings";
import { useSearch } from "../../shared/search/SearchContext";
import styles from "./ListingsPage.module.scss";
import {
  FormControl,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";

const ITEMS_PER_PAGE = 10;

type ViewMode = "grid" | "list" | "row";
type SortKey =
  | "date_desc"
  | "date_asc"
  | "price_desc"
  | "price_asc"
  | "priority";

const statusLabel: Record<ModerationStatus, string> = {
  pending: "На модерации",
  approved: "Одобрено",
  rejected: "Отклонено",
};

const priorityLabel: Record<Priority, string> = {
  normal: "Обычное",
  urgent: "Срочное",
};

const defaultFilters: Filters = {
  statuses: ["pending", "approved", "rejected"],
  categories: [],
  priorities: ["normal", "urgent"],
  priceFrom: undefined,
  priceTo: undefined,
  onlyWithPrice: false,
};

const parseCreatedAt = (createdAt: string): number => {
  try {
    const [datePart, timePart] = createdAt.split(",");
    if (!datePart || !timePart) return 0;

    const [dayStr, monthStr, yearStr] = datePart.trim().split(".");
    const [hourStr, minuteStr] = timePart.trim().split(":");

    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);
    const hour = Number(hourStr);
    const minute = Number(minuteStr);

    if (
      Number.isNaN(day) ||
      Number.isNaN(month) ||
      Number.isNaN(year) ||
      Number.isNaN(hour) ||
      Number.isNaN(minute)
    ) {
      return 0;
    }

    return new Date(year, month - 1, day, hour, minute).getTime();
  } catch {
    return 0;
  }
};

export const ListingsPage: React.FC = () => {
  const [listings] = useState<ListingWithMeta[]>(() => getInitialListings());
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("date_desc");
  const [currentPage, setCurrentPage] = useState(1);

  const { query } = useSearch();

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const handleSortChange = (e: SelectChangeEvent): void => {
    setSortKey(e.target.value as SortKey);
    setCurrentPage(1);
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const filteredAndSorted: ListingWithMeta[] = useMemo(() => {
    let result = [...listings];

    if (filters.statuses.length > 0) {
      result = result.filter((item) => filters.statuses.includes(item.status));
    }

    if (filters.categories.length > 0) {
      result = result.filter((item) =>
        filters.categories.includes(item.category)
      );
    }

    if (filters.priorities.length > 0) {
      result = result.filter((item) =>
        filters.priorities.includes(item.priority)
      );
    }

    if (filters.onlyWithPrice) {
      result = result.filter((item) => item.priceValue > 0);
    }

    if (filters.priceFrom !== undefined) {
      result = result.filter((item) => item.priceValue >= filters.priceFrom!);
    }

    if (filters.priceTo !== undefined) {
      result = result.filter((item) => item.priceValue <= filters.priceTo!);
    }

    if (query.trim()) {
      const s = query.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(s) ||
          item.category.toLowerCase().includes(s) ||
          String(item.id).includes(s)
      );
    }

    result.sort((a, b) => {
      const aDate = parseCreatedAt(a.createdAt);
      const bDate = parseCreatedAt(b.createdAt);

      switch (sortKey) {
        case "price_asc":
          return a.priceValue - b.priceValue;
        case "price_desc":
          return b.priceValue - a.priceValue;
        case "date_asc":
          return aDate - bDate;
        case "date_desc":
          return bDate - aDate;
        case "priority":
          return b.priorityWeight - a.priorityWeight || bDate - aDate;
        default:
          return 0;
      }
    });

    return result;
  }, [filters, sortKey, query, listings]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE)
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredAndSorted.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const hasResults = filteredAndSorted.length > 0;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <header className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <h1 className={styles.title}>Лента модерации</h1>
            <span className={styles.meta}>
              Найдено {filteredAndSorted.length} объявлений
            </span>
          </div>
          <div className={styles.toolbarRight}>
            <div className={styles.sortControl}>
              <span className={styles.sortLabel}>Сортировка:</span>
              <FormControl size="small" className={styles.sortSelectControl}>
                <Select
                  value={sortKey}
                  onChange={handleSortChange}
                  className={styles.sortSelect}
                >
                  <MenuItem value="date_desc">По дате — новые сверху</MenuItem>
                  <MenuItem value="date_asc">По дате — старые сверху</MenuItem>
                  <MenuItem value="price_asc">
                    По цене — по возрастанию
                  </MenuItem>
                  <MenuItem value="price_desc">По цене — по убыванию</MenuItem>
                  <MenuItem value="priority">По приоритету</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className={styles.viewToggle}>
              <button
                type="button"
                className={`${styles.viewButton} ${
                  viewMode === "grid" ? styles.viewButtonActive : ""
                }`}
                onClick={() => handleViewChange("grid")}
              >
                ▇
              </button>
              <button
                type="button"
                className={`${styles.viewButton} ${
                  viewMode === "row" ? styles.viewButtonActive : ""
                }`}
                onClick={() => handleViewChange("row")}
              >
                ▬
              </button>
              <button
                type="button"
                className={`${styles.viewButton} ${
                  viewMode === "list" ? styles.viewButtonActive : ""
                }`}
                onClick={() => handleViewChange("list")}
              >
                ☰
              </button>
            </div>
          </div>
        </header>

        <SidebarFilters value={filters} onChange={handleFiltersChange} />

        <section className={styles.content}>
          {hasResults ? (
            viewMode === "grid" ? (
              <div className={styles.grid}>
                {pageItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/item/${item.id}`}
                    className={styles.cardLink}
                  >
                    <ListingCard item={item as Listing} mode="grid" />
                  </Link>
                ))}
              </div>
            ) : viewMode === "list" ? (
              <table className={styles.listTable}>
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Категория</th>
                    <th>Цена</th>
                    <th>Статус</th>
                    <th>Приоритет</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link
                          to={`/item/${item.id}`}
                          className={styles.listTitleLink}
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td>{item.category}</td>
                      <td>{item.price}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[`status_${item.status}`]
                          }`}
                        >
                          {statusLabel[item.status]}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.priorityBadge} ${
                            item.priority === "urgent"
                              ? styles.priorityBadgeUrgent
                              : ""
                          }`}
                        >
                          {priorityLabel[item.priority]}
                        </span>
                      </td>
                      <td>{item.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.rowList}>
                {pageItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/item/${item.id}`}
                    className={styles.cardLink}
                  >
                    <ListingCard item={item as Listing} mode="row" />
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>Нет подходящих вариантов</div>
            </div>
          )}
        </section>

        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageNavButton}
            disabled={currentPage === 1 || !hasResults}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Назад
          </button>
          {hasResults &&
            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={`${styles.pageButton} ${
                  page === currentPage ? styles.pageButtonActive : ""
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          <button
            type="button"
            className={styles.pageNavButton}
            disabled={currentPage === totalPages || !hasResults}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Вперёд
          </button>
        </div>
      </main>
    </div>
  );
};
