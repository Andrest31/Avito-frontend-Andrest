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
import type { ModerationDecision } from "../../shared/listing/moderationDecision";

const ITEMS_PER_PAGE = 10;

type ViewMode = "grid" | "list" | "row";
type SortKey =
  | "date_desc"
  | "date_asc"
  | "price_desc"
  | "price_asc"
  | "priority";

type EnhancedListing = Listing & {
  priceValue: number;
  priorityWeight: number;
};

const statusLabel: Record<ModerationStatus, string> = {
  pending: "На модерации",
  approved: "Одобрено",
  rejected: "Отклонено",
  draft: "Черновик",
};

const priorityLabel: Record<Priority, string> = {
  normal: "Обычное",
  urgent: "Срочное",
};

const REASON_TEMPLATES = [
  "Запрещенный товар",
  "Неверная категория",
  "Некорректное описание",
  "Проблемы с фото",
  "Подозрение на мошенничество",
  "Другое",
];

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

    const [d, m, y] = datePart.trim().split(".");
    const [hh, mm] = timePart.trim().split(":");

    return new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      Number(hh),
      Number(mm)
    ).getTime();
  } catch {
    return 0;
  }
};

function normalize(ad: Advertisement): EnhancedListing {
  const statusMap: Record<Advertisement["status"], ModerationStatus> = {
    pending: "pending",
    approved: "approved",
    rejected: "rejected",
    draft: "pending",
  };

  const priorityMap: Record<Advertisement["priority"], Priority> = {
    normal: "normal",
    urgent: "urgent",
  };

  const createdAt = new Date(ad.createdAt).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: ad.id,
    title: ad.title,
    price: ad.price.toLocaleString("ru-RU") + " ₽",
    priceValue: ad.price,
    category: ad.category,
    status: statusMap[ad.status],
    priority: priorityMap[ad.priority],
    createdAt,
    priorityWeight: ad.priority === "urgent" ? 2 : 1,
    image: ad.images?.[0] || "/placeholder.png",
  };
}

export const ListingsPage: React.FC = () => {
  const [listings, setListings] = useState<EnhancedListing[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("date_desc");
  const [currentPage, setCurrentPage] = useState(1);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkDecision, setBulkDecision] =
    useState<ModerationDecision | null>(null);
  const [bulkReason, setBulkReason] = useState(REASON_TEMPLATES[0]);
  const [bulkComment, setBulkComment] = useState("");

  const { query } = useSearch();

  useEffect(() => {
    const controller = new AbortController();
    setApiLoading(true);
    setApiError(null);

    adsApi
      .getAll(controller.signal)
      .then((data) => setListings(data.ads.map(normalize)))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setApiError(
          err instanceof Error ? err.message : "Ошибка загрузки объявлений"
        );
      })
      .finally(() => setApiLoading(false));

    return () => controller.abort();
  }, []);

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const handleSortChange = (e: SelectChangeEvent) => {
    setSortKey(e.target.value as SortKey);
    setCurrentPage(1);
  };

  const toggleSelectId = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const handleToggleSelection = () => {
    setIsSelectionMode((prev) => {
      const next = !prev;
      if (!next) setSelectedIds([]);
      return next;
    });
  };

  const reloadAfterBulk = async () => {
    try {
      const data = await adsApi.getAll();
      setListings(data.ads.map(normalize));
    } catch (err) {
      console.error("Ошибка обновления:", err);
    }
  };

  const handleBulkDecision = (decision: ModerationDecision) => {
    if (!selectedIds.length) return;

    if (decision === "approved") {
      void performBulkRequest("approved", null, null);
      return;
    }

    setBulkDecision(decision);
    setBulkReason(REASON_TEMPLATES[0]);
    setBulkComment("");
    setIsBulkModalOpen(true);
  };

  const performBulkRequest = async (
    decision: ModerationDecision,
    reason: string | null,
    comment: string | null
  ) => {
    if (!selectedIds.length) return;

    try {
      setBulkLoading(true);

      const tasks = selectedIds.map((id) => {
        if (decision === "approved") {
          return adsApi.approve(id);
        }

        const finalReason = reason ?? REASON_TEMPLATES[0];
        const finalComment =
          comment && comment.trim().length > 0 ? comment.trim() : undefined;

        if (decision === "rejected") {
          return adsApi.reject(id, finalReason, finalComment);
        }

        return adsApi.requestChanges(id, finalReason, finalComment);
      });

      await Promise.all(tasks);

      await reloadAfterBulk();
      clearSelection();

      setIsBulkModalOpen(false);
      setBulkDecision(null);
      setBulkComment("");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkModalConfirm = () => {
    if (!bulkDecision) return;
    void performBulkRequest(bulkDecision, bulkReason, bulkComment);
  };

  const handleBulkModalCancel = () => {
    setIsBulkModalOpen(false);
    setBulkDecision(null);
    setBulkComment("");
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...listings];

    if (filters.statuses.length > 0) {
      result = result.filter((i) => filters.statuses.includes(i.status));
    }

    if (filters.categories.length > 0) {
      result = result.filter((i) => filters.categories.includes(i.category));
    }

    if (filters.priorities.length > 0) {
      result = result.filter((i) => filters.priorities.includes(i.priority));
    }

    if (filters.onlyWithPrice) {
      result = result.filter((i) => i.priceValue > 0);
    }

    if (filters.priceFrom !== undefined) {
      result = result.filter((i) => i.priceValue >= filters.priceFrom!);
    }

    if (filters.priceTo !== undefined) {
      result = result.filter((i) => i.priceValue <= filters.priceTo!);
    }

    if (query.trim()) {
      const s = query.trim().toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(s) ||
          i.category.toLowerCase().includes(s) ||
          String(i.id).includes(s)
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
          return (
            b.priorityWeight - a.priorityWeight ||
            bDate - aDate
          );
        default:
          return 0;
      }
    });

    return result;
  }, [filters, sortKey, query, listings]);

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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
              {apiLoading
                ? "Загрузка…"
                : `Найдено ${filteredAndSorted.length} объявлений`}
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
                  <MenuItem value="date_desc">
                    По дате — новые сверху
                  </MenuItem>
                  <MenuItem value="date_asc">
                    По дате — старые сверху
                  </MenuItem>
                  <MenuItem value="price_asc">
                    По цене — по возрастанию
                  </MenuItem>
                  <MenuItem value="price_desc">
                    По цене — по убыванию
                  </MenuItem>
                  <MenuItem value="priority">
                    По приоритету
                  </MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className={styles.viewToggle}>
              <button
                type="button"
                className={`${styles.viewButton} ${
                  viewMode === "grid" ? styles.viewButtonActive : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                ▇
              </button>
              <button
                type="button"
                className={`${styles.viewButton} ${
                  viewMode === "row" ? styles.viewButtonActive : ""
                }`}
                onClick={() => setViewMode("row")}
              >
                ▬
              </button>
              <button
                type="button"
                className={`${styles.viewButton} ${
                  viewMode === "list" ? styles.viewButtonActive : ""
                }`}
                onClick={() => setViewMode("list")}
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
          onToggleSelection={handleToggleSelection}
          onBulkDecision={handleBulkDecision}
        />

        <section className={styles.content}>
          {apiError && <div className={styles.error}>{apiError}</div>}

          {apiLoading && !hasResults && !apiError && (
            <div className={styles.emptyState}>Загрузка…</div>
          )}

          {!apiLoading && !hasResults && !apiError && (
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>Нет подходящих вариантов</div>
            </div>
          )}

          {!apiLoading && hasResults && (
            <>
              {viewMode === "grid" && (
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
                        selectable={isSelectionMode}
                        selected={selectedIds.includes(item.id)}
                        onToggleSelect={() => toggleSelectId(item.id)}
                      />
                    </Link>
                  ))}
                </div>
              )}

              {viewMode === "row" && (
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
                        selectable={isSelectionMode}
                        selected={selectedIds.includes(item.id)}
                        onToggleSelect={() => toggleSelectId(item.id)}
                      />
                    </Link>
                  ))}
                </div>
              )}

              {viewMode === "list" && (
                <table className={styles.listTable}>
                  <thead>
                    <tr>
                      {isSelectionMode && <th />}
                      <th>Название</th>
                      <th>Категория</th>
                      <th>Цена</th>
                      <th>Статус</th>
                      <th>Приоритет</th>
                      <th>Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((item) => {
                      const selected = selectedIds.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          className={selected ? styles.listRowSelected : ""}
                        >
                          {isSelectionMode && (
                            <td>
                              <button
                                type="button"
                                className={`${styles.rowSelectCheckbox} ${
                                  selected
                                    ? styles.rowSelectCheckboxActive
                                    : ""
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleSelectId(item.id);
                                }}
                              >
                                {selected ? "✓" : ""}
                              </button>
                            </td>
                          )}
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
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
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

          {hasResults && (
            <>
              <button
                type="button"
                className={`${styles.pageButton} ${
                  currentPage === 1 ? styles.pageButtonActive : ""
                }`}
                onClick={() => handlePageChange(1)}
              >
                1
              </button>

              {currentPage > 3 && (
                <span className={styles.pageDots}>...</span>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === currentPage ||
                    page === currentPage - 1 ||
                    page === currentPage + 1
                )
                .filter(
                  (page, index, arr) =>
                    page > 1 &&
                    page < totalPages &&
                    arr.indexOf(page) === index
                )
                .map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`${styles.pageButton} ${
                      page === currentPage
                        ? styles.pageButtonActive
                        : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

              {currentPage < totalPages - 2 && (
                <span className={styles.pageDots}>...</span>
              )}

              {totalPages > 1 && (
                <button
                  type="button"
                  className={`${styles.pageButton} ${
                    totalPages === currentPage
                      ? styles.pageButtonActive
                      : ""
                  }`}
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              )}
            </>
          )}

          <button
            type="button"
            className={styles.pageNavButton}
            disabled={currentPage === totalPages || !hasResults}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Вперёд
          </button>
        </div>

        {isBulkModalOpen && bulkDecision && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
              <h3 className={styles.modalTitle}>Выберите причину</h3>

              <div className={styles.modalReasons}>
                {REASON_TEMPLATES.map((reason) => (
                  <label key={reason} className={styles.modalReasonRow}>
                    <input
                      type="radio"
                      name="bulkReason"
                      value={reason}
                      checked={bulkReason === reason}
                      onChange={() => setBulkReason(reason)}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <textarea
                className={styles.modalComment}
                placeholder="Дополнительный комментарий (необязательно)"
                value={bulkComment}
                onChange={(e) => setBulkComment(e.target.value)}
                rows={3}
              />

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCancel}
                  onClick={handleBulkModalCancel}
                  disabled={bulkLoading}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className={styles.modalConfirm}
                  onClick={handleBulkModalConfirm}
                  disabled={bulkLoading}
                >
                  Подтвердить
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
