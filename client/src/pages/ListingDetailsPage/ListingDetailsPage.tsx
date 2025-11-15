import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../../shared/layout/Header";
import styles from "./ListingDetailsPage.module.scss";
import {
  getInitialListings,
  saveListingsState,
  type ListingWithMeta,
  type ModerationHistoryItem,
  type Characteristic,
  type ModerationDecision,
} from "../../shared/listing/mockListings";
import type { ModerationStatus } from "../../shared/listing/ListingCard";

const statusLabel: Record<ModerationStatus, string> = {
  pending: "На модерации",
  approved: "Одобрено",
  rejected: "Отклонено",
};

const decisionLabel: Record<ModerationDecision, string> = {
  approved: "Одобрено",
  rejected: "Отклонено",
  returned: "На доработку",
};

const REASON_TEMPLATES = [
  "Запрещённый товар",
  "Неверная категория",
  "Некорректное описание",
  "Проблемы с фото",
  "Подозрение на мошенничество",
  "Другое",
];

export const ListingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [listings, setListings] = useState<ListingWithMeta[]>(() =>
    getInitialListings()
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // модалка
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDecision, setModalDecision] =
    useState<ModerationDecision | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(
    REASON_TEMPLATES[0]
  );
  const [modalComment, setModalComment] = useState("");

  const listingId = Number(id);
  const index = useMemo(
    () => listings.findIndex((item) => item.id === listingId),
    [listings, listingId]
  );

  const listing = index >= 0 ? listings[index] : null;

  const prevId =
    index > 0 ? listings[index - 1].id : undefined;
  const nextId =
    index >= 0 && index < listings.length - 1
      ? listings[index + 1].id
      : undefined;

  if (!listing || Number.isNaN(listingId)) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/list")}
          >
            ← Назад к списку
          </button>
          <div className={styles.card}>Объявление не найдено.</div>
        </main>
      </div>
    );
  }

  const applyDecision = (
    decision: ModerationDecision,
    commentFromModal?: string
  ) => {
    const nextStatus: ModerationStatus =
      decision === "approved"
        ? "approved"
        : decision === "rejected"
        ? "rejected"
        : "pending";

    const finalComment =
      commentFromModal ||
      (decision === "approved"
        ? "Объявление одобрено"
        : decision === "returned"
        ? "Объявление возвращено на доработку"
        : "Объявление отклонено");

    setListings((prev) => {
      const updated: ListingWithMeta[] = prev.map((item, idx) => {
        if (idx !== index) return item;

        const now = new Date();
        const historyItem: ModerationHistoryItem = {
          id: item.moderationHistory.length + 1,
          moderator: "Текущий модератор",
          decision,
          dateISO: now.toISOString(),
          comment: finalComment,
        };

        return {
          ...item,
          status: nextStatus,
          moderationHistory: [...item.moderationHistory, historyItem],
        };
      });

      saveListingsState(updated);
      return updated;
    });
  };

  const openReasonModal = (decision: ModerationDecision) => {
    // Одобрить — без модалки
    if (decision === "approved") {
      applyDecision("approved");
      return;
    }
    setModalDecision(decision);
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (!modalDecision) return;
    if (!selectedReason.trim()) {
      alert("Выберите причину");
      return;
    }

    const comment =
      modalComment.trim().length > 0
        ? `${selectedReason}: ${modalComment.trim()}`
        : selectedReason;

    applyDecision(modalDecision, comment);

    setIsModalOpen(false);
    setModalDecision(null);
    setModalComment("");
    setSelectedReason(REASON_TEMPLATES[0]);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setModalDecision(null);
    setModalComment("");
    setSelectedReason(REASON_TEMPLATES[0]);
  };

  const historySorted = [...listing.moderationHistory].sort(
    (a, b) =>
      new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const handleNav = (targetId?: number) => {
    if (!targetId) return;
    navigate(`/item/${targetId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveImageIndex(0);
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/list")}
        >
          ← Назад к списку
        </button>

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.badgesRow}>
              <span
                className={`${styles.status} ${
                  styles[`status_${listing.status}`]
                }`}
              >
                {statusLabel[listing.status]}
              </span>

              <span
                className={`${styles.priorityBadge} ${
                  listing.priority === "urgent"
                    ? styles.priorityBadgeUrgent
                    : ""
                }`}
              >
                {listing.priority === "urgent"
                  ? "Срочное объявление"
                  : "Обычное объявление"}
              </span>
            </div>

            <h1 className={styles.title}>{listing.title}</h1>

            <div className={styles.metaRow}>
              <span>{listing.category}</span>
              <span className={styles.dot}>•</span>
              <span>{listing.createdAt}</span>
              <span className={styles.dot}>•</span>
              <span>{listing.views} просмотров</span>
            </div>
          </div>

          {/* ЦЕНА — справа, высоко как в макете */}
          <div className={styles.headerRight}>
            <div className={styles.priceTopLabel}>Цена</div>
            <div className={styles.priceTopValue}>{listing.price}</div>
          </div>
        </header>

        <div className={styles.layout}>
          <section className={styles.left}>
            <div className={styles.card}>
              <div className={styles.gallery}>
                <img
                  src={listing.gallery[activeImageIndex]}
                  alt={listing.title}
                  className={styles.mainImage}
                />
                <div className={styles.thumbnails}>
                  {listing.gallery.map((src, idx) => (
                    <button
                      key={src}
                      type="button"
                      className={`${styles.thumbnailButton} ${
                        idx === activeImageIndex
                          ? styles.thumbnailButtonActive
                          : ""
                      }`}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img
                        src={src}
                        alt={`${listing.title} ${idx + 1}`}
                        className={styles.thumbnailImage}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Описание</h2>
                <p className={styles.description}>
                  {listing.description}
                </p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Характеристики</h2>
                <table className={styles.characteristicsTable}>
                  <tbody>
                    {listing.characteristics.map(
                      (row: Characteristic) => (
                        <tr key={row.key}>
                          <td className={styles.characteristicsKey}>
                            {row.key}
                          </td>
                          <td className={styles.characteristicsValue}>
                            {row.value}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </section>
            </div>

            <section
              className={`${styles.card} ${styles.historyCard}`}
            >
              <h2 className={styles.sectionTitle}>
                История модерации
              </h2>
              <ul className={styles.historyList}>
                {historySorted.map(
                  (item: ModerationHistoryItem, idx) => (
                    <li
                      key={item.id}
                      className={styles.historyItem}
                    >
                      <div className={styles.historyBullet} />
                      <div className={styles.historyContent}>
                        <div className={styles.historyTopRow}>
                          <span className={styles.historyModerator}>
                            {item.moderator}
                          </span>
                          <span className={styles.historyDecision}>
                            {decisionLabel[item.decision]}
                          </span>
                          <span className={styles.historyDate}>
                            {formatDate(item.dateISO)}
                          </span>
                        </div>
                        {item.comment && (
                          <p className={styles.historyComment}>
                            {item.comment}
                          </p>
                        )}
                        {idx <
                          historySorted.length - 1 && (
                          <div
                            className={styles.historyConnector}
                          />
                        )}
                      </div>
                    </li>
                  )
                )}
              </ul>
            </section>
          </section>

          <aside className={styles.right}>
            <div className={styles.card}>
              <div className={styles.sideBlockHeader}>
                <span className={styles.sideBlockTitle}>
                  Решение модератора
                </span>
                <span className={styles.sideBlockHint}>
                  Применяется только после выбора действия
                </span>
              </div>

              <div className={styles.moderationButtons}>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionApprove}`}
                  onClick={() => openReasonModal("approved")}
                >
                  Одобрить
                </button>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionReject}`}
                  onClick={() => openReasonModal("rejected")}
                >
                  Отклонить
                </button>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionReturn}`}
                  onClick={() => openReasonModal("returned")}
                >
                  Вернуть на доработку
                </button>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.sellerBlock}>
                <div className={styles.sellerAvatar}>
                  {listing.seller.name.charAt(0)}
                </div>
                <div className={styles.sellerInfo}>
                  <div className={styles.sellerName}>
                    {listing.seller.name}
                  </div>
                  <div className={styles.sellerStatus}>
                    Рейтинг {listing.seller.rating.toFixed(1)} ·{" "}
                    {listing.seller.totalListings} объявлений · на площадке с{" "}
                    {listing.seller.registeredAt}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.navRow}>
              <button
                type="button"
                className={styles.navButton}
                disabled={!prevId}
                onClick={() => handleNav(prevId)}
              >
                ← Предыдущее
              </button>
              <button
                type="button"
                className={styles.navButton}
                disabled={!nextId}
                onClick={() => handleNav(nextId)}
              >
                Следующее →
              </button>
            </div>
          </aside>
        </div>

        {/* Модалка выбора причины */}
        {isModalOpen && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
              <h3 className={styles.modalTitle}>Выберите причину</h3>

              <div className={styles.modalReasons}>
                {REASON_TEMPLATES.map((reason) => (
                  <label key={reason} className={styles.modalReasonRow}>
                    <input
                      type="radio"
                      name="rejectReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <textarea
                className={styles.modalComment}
                placeholder="Дополнительный комментарий (необязательно)"
                value={modalComment}
                onChange={(e) => setModalComment(e.target.value)}
                rows={3}
              />

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCancel}
                  onClick={handleModalCancel}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className={styles.modalConfirm}
                  onClick={handleModalConfirm}
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
