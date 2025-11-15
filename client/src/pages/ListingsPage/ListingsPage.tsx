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
  mockListings,
  type ListingWithMeta,
} from "../../shared/listing/mockListings";
import styles from "./ListingsPage.module.scss";

const ITEMS_PER_PAGE = 10;

type ViewMode = "grid" | "list";

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

export const ListingsPage: React.FC = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("date_desc");
  const [currentPage, setCurrentPage] = useState(1);

  // сбрасываем страницу при изменении фильтров
  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    setCurrentPage(1);
  };

  // и при изменении сортировки тоже
  const handleSortChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setSortKey(e.target.value as SortKey);
    setCurrentPage(1);
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const filteredAndSorted: ListingWithMeta[] = useMemo(() => {
    let result = [...mockListings];

    // фильтрация
    result = result.filter((item) => filters.statuses.includes(item.status));

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

    // сортировка
    result.sort((a, b) => {
      switch (sortKey) {
        case "price_asc":
          return a.priceValue - b.priceValue;
        case "price_desc":
          return b.priceValue - a.priceValue;
        case "date_asc":
          return a.createdOrder - b.createdOrder;
        case "date_desc":
          return b.createdOrder - a.createdOrder;
        case "priority":
          return (
            b.priorityWeight - a.priorityWeight ||
            b.createdOrder - a.createdOrder
          );
        default:
          return 0;
      }
    });

    return result;
  }, [filters, sortKey]);

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
    }
  };

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
            <label className={styles.sortControl}>
              <span className={styles.sortLabel}>Сортировка:</span>
              <select
                className={styles.sortSelect}
                value={sortKey}
                onChange={handleSortChange}
              >
                <option value="date_desc">По дате — новые сверху</option>
                <option value="date_asc">По дате — старые сверху</option>
                <option value="price_asc">По цене — по возрастанию</option>
                <option value="price_desc">По цене — по убыванию</option>
                <option value="priority">По приоритету</option>
              </select>
            </label>

            <div className={styles.viewToggle}>
              <button
                type="button"
                className={`${styles.viewButton} ${
                  viewMode === "grid" ? styles.viewButtonActive : ""
                }`}
                onClick={() => handleViewChange("grid")}
              >
                ⬛
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
          {viewMode === "grid" ? (
            <div className={styles.grid}>
              {pageItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/item/${item.id}`}
                  className={styles.cardLink}
                >
                  <ListingCard item={item as Listing} />
                </Link>
              ))}
            </div>
          ) : (
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
                    <td>{priorityLabel[item.priority]}</td>
                    <td>{item.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Пагинация */}
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageNavButton}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Назад
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Вперёд
          </button>
        </div>
      </main>
    </div>
  );
};
