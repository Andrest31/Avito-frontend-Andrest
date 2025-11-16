import React, { useEffect, useMemo, useState } from "react";
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
import styles from "./ListingsPage.module.scss";
import {
  FormControl,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";
import { adsApi, type Advertisement } from "../../api/ads";
import { useSearch } from "../../shared/search/SearchContext";

const ITEMS_PER_PAGE = 10;

type ViewMode = "grid" | "list" | "row";
type SortKey =
  | "date_desc"
  | "date_asc"
  | "price_desc"
  | "price_asc"
  | "priority";

// ✨ Нормализация API → формат твоего фронта
function normalize(ad: Advertisement): Listing & {
  priceValue: number;
  priorityWeight: number;
} {
  return {
    id: ad.id,
    title: ad.title,
    price: ad.price.toLocaleString("ru-RU") + " ₽",
    priceValue: ad.price,
    category: ad.category,
    status: ad.status as ModerationStatus,
    priority: ad.priority as Priority,
    createdAt: new Date(ad.createdAt).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    priorityWeight: ad.priority === "urgent" ? 2 : 1,
    image: ad.images?.[0] || "/placeholder.png",
  };
}

export const ListingsPage: React.FC = () => {
  const [listings, setListings] = useState<
    (Listing & { priceValue: number; priorityWeight: number })[]
  >([]);

  const [filters, setFilters] = useState<Filters>({
    statuses: ["pending", "approved", "rejected"],
    categories: [],
    priorities: ["normal", "urgent"],
    priceFrom: undefined,
    priceTo: undefined,
    onlyWithPrice: false,
  });

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("date_desc");
  const [currentPage, setCurrentPage] = useState(1);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [, setSelectedIds] = useState<number[]>([]);

  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const { query } = useSearch();

  // 🚀 Загружаем объявления с API
  useEffect(() => {
    const controller = new AbortController();

    adsApi
      .getAll(controller.signal)
      .then((data) => {
        const normalized = data.ads.map(normalize);
        setListings(normalized);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setApiError(err.message);
        }
      })
      .finally(() => setApiLoading(false));

    return () => controller.abort();
  }, []);

  // смена фильтров — на первую страницу
  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    setCurrentPage(1);
  };

  // смена сортировки — тоже на первую
  const handleSortChange = (e: SelectChangeEvent) => {
    setSortKey(e.target.value as SortKey);
    setCurrentPage(1);
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...listings];

    // Фильтрация
    if (filters.statuses.length)
      result = result.filter((i) => filters.statuses.includes(i.status));

    if (filters.categories.length)
      result = result.filter((i) => filters.categories.includes(i.category));

    if (filters.priorities.length)
      result = result.filter((i) => filters.priorities.includes(i.priority));

    if (filters.onlyWithPrice) result = result.filter((i) => i.priceValue > 0);

    if (filters.priceFrom !== undefined)
      result = result.filter((i) => i.priceValue >= filters.priceFrom!);

    if (filters.priceTo !== undefined)
      result = result.filter((i) => i.priceValue <= filters.priceTo!);

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          String(i.id).includes(q)
      );
    }

    // Сортировка
    result.sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();

      switch (sortKey) {
        case "date_asc":
          return aDate - bDate;
        case "date_desc":
          return bDate - aDate;
        case "price_asc":
          return a.priceValue - b.priceValue;
        case "price_desc":
          return b.priceValue - a.priceValue;
        case "priority":
          return b.priorityWeight - a.priorityWeight;
        default:
          return 0;
      }
    });

    return result;
  }, [listings, filters, sortKey, query]);

  // 🔢 Пагинация
  const hasResults = filteredAndSorted.length > 0;
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
    if (!hasResults) return;
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <div className={styles.sortControl}>
              <span className={styles.sortLabel}>Сортировка:</span>
              <FormControl
                size="small"
                className={styles.sortSelectControl}
              >
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
                  <MenuItem value="price_desc">
                    По цене — по убыванию
                  </MenuItem>
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

        <SidebarFilters
          value={filters}
          onChange={handleFiltersChange}
          isSelectionMode={isSelectionMode}
          onToggleSelection={() => {
            setIsSelectionMode((v) => !v);
            if (isSelectionMode) setSelectedIds([]);
          }}
          onBulkDecision={() => {}}
        />

        <section className={styles.content}>
          {apiLoading && <div>Загрузка…</div>}
          {apiError && <div className={styles.error}>{apiError}</div>}

          {!apiLoading && !hasResults && !apiError && (
            <div className={styles.emptyState}>Нет объявлений</div>
          )}

          {!apiLoading && hasResults && (
            <>
              {viewMode === "grid" ? (
                <div className={styles.grid}>
                  {pageItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/item/${item.id}`}
                      className={styles.cardLink}
                    >
                      <ListingCard
                        item={item}
                        mode="grid"
                      />
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
                        <td>{item.status}</td>
                        <td>{item.priority}</td>
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
                      <ListingCard
                        item={item}
                        mode="row"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* 🔽 Пагинация снизу */}
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
