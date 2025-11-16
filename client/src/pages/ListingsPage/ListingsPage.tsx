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

  const [viewMode, ] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("date_desc");
  const [currentPage, ] = useState(1);

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

  
  const pageItems = filteredAndSorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <header className={styles.toolbar}>
          <div>
            <h1 className={styles.title}>Лента модерации</h1>
            <span className={styles.meta}>
              Найдено {filteredAndSorted.length} объявлений
            </span>
          </div>

          <div className={styles.sortControl}>
            <span className={styles.sortLabel}>Сортировка:</span>
            <FormControl size="small">
              <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
                <MenuItem value="date_desc">По дате — новые сверху</MenuItem>
                <MenuItem value="date_asc">По дате — старые сверху</MenuItem>
                <MenuItem value="price_asc">По цене — по возрастанию</MenuItem>
                <MenuItem value="price_desc">По цене — по убыванию</MenuItem>
                <MenuItem value="priority">По приоритету</MenuItem>
              </Select>
            </FormControl>
          </div>
        </header>

        <SidebarFilters
          value={filters}
          onChange={setFilters}
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

          {!apiLoading && !filteredAndSorted.length && (
            <div className={styles.emptyState}>Нет объявлений</div>
          )}

          {!apiLoading && filteredAndSorted.length > 0 && (
            <div
              className={
                viewMode === "grid"
                  ? styles.grid
                  : viewMode === "row"
                  ? styles.rowList
                  : styles.listTable
              }
            >
              {pageItems.map((item) => (
                <Link key={item.id} to={`/item/${item.id}`} className={styles.cardLink}>
                  <ListingCard item={item} mode={viewMode === "grid" ? "grid" : "row"} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
