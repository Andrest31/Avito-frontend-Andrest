import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../../shared/layout/Header";
import styles from "./ListingDetailsPage.module.scss";

// API
import { adsApi, type Advertisement } from "../../api/ads";

// -------- Normalizer ----------
function normalize(ad: Advertisement) {
  return {
    id: ad.id,
    title: ad.title,
    description: ad.description,
    price: ad.price.toLocaleString("ru-RU") + " ₽",
    category: ad.category,
    status: ad.status,
    priority: ad.priority,
    createdAt: new Date(ad.createdAt).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    views: 0,
    gallery: ad.images,
    characteristics: Object.entries(ad.characteristics).map(([key, value]) => ({
      key,
      value,
    })),
    seller: {
      name: ad.seller.name,
      rating: Number(ad.seller.rating),
      totalListings: ad.seller.totalAds,
      registeredAt: new Date(ad.seller.registeredAt).toLocaleDateString(
        "ru-RU"
      ),
    },
    moderationHistory: ad.moderationHistory.map((h) => ({
      id: h.id,
      moderator: h.moderatorName,
      decision:
        h.action === "approved"
          ? "approved"
          : h.action === "rejected"
          ? "rejected"
          : "returned",
      dateISO: h.timestamp,
      comment: h.comment,
    })),
  };
}

// ---------- Status labels ----------
const statusLabel: Record<Advertisement["status"], string> = {
  pending: "На модерации",
  approved: "Одобрено",
  rejected: "Отклонено",
  draft: "Черновик",
};

export const ListingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [adRaw, setAdRaw] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastRef = useRef<number | null>(null);

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setLoading(true);
  setError(null);
}, [id]);

  useEffect(() => {
  if (!id) return;

  const controller = new AbortController();

  adsApi
    .getById(Number(id))
    .then((data) => setAdRaw(data))
    .catch((err) => {
      if (err.name !== "AbortError") setError(err.message);
    })
    .finally(() => setLoading(false));

  return () => controller.abort();
}, [id]);


  // ------ Toast cleanup ------
  useEffect(() => {
    return () => {
      if (toastRef.current) clearTimeout(toastRef.current);
    };
  }, []);

  const showToast = (text: string) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToastMessage(text);

    toastRef.current = window.setTimeout(() => setToastMessage(null), 3000);
  };

  // Not loaded / error
  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>Загрузка объявления…</main>
      </div>
    );
  }

  if (error || !adRaw) {
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
          <div className={styles.card}>Ошибка загрузки объявления.</div>
        </main>
      </div>
    );
  }

  const listing = normalize(adRaw);

  // -------- Prev/Next placeholders (will connect later) -------
  const prevId = undefined;
  const nextId = undefined;

  const historySorted = [...listing.moderationHistory].sort(
    (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const handleNav = (targetId?: number) => {
    if (!targetId) return;
    navigate(`/item/${targetId}`);
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.page}>
      <Header />

      {toastMessage && (
        <div className={styles.toast}>
          <span className={styles.toastIcon}>✓</span>
          <span className={styles.toastText}>{toastMessage}</span>
        </div>
      )}

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
                      key={idx}
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
                <p className={styles.description}>{listing.description}</p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Характеристики</h2>
                <table className={styles.characteristicsTable}>
                  <tbody>
                    {listing.characteristics.map((row) => (
                      <tr key={row.key}>
                        <td className={styles.characteristicsKey}>
                          {row.key}
                        </td>
                        <td className={styles.characteristicsValue}>
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>

            <section className={`${styles.card} ${styles.historyCard}`}>
              <h2 className={styles.sectionTitle}>История модерации</h2>

              <ul className={styles.historyList}>
                {historySorted.map((item, idx) => (
                  <li key={item.id} className={styles.historyItem}>
                    <div className={styles.historyBullet} />
                    <div className={styles.historyContent}>
                      <div className={styles.historyTopRow}>
                        <span className={styles.historyModerator}>
                          {item.moderator}
                        </span>
                        <span className={styles.historyDecision}>
                          {item.decision === "approved"
                            ? "Одобрено"
                            : item.decision === "rejected"
                            ? "Отклонено"
                            : "На доработку"}
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

                      {idx < historySorted.length - 1 && (
                        <div className={styles.historyConnector} />
                      )}
                    </div>
                  </li>
                ))}
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
                  В следующем шаге подключим POST-запросы
                </span>
              </div>

              <div className={styles.moderationButtons}>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionApprove}`}
                  onClick={() => showToast("Пока не подключено")}
                >
                  Одобрить
                </button>

                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionReject}`}
                  onClick={() => showToast("Пока не подключено")}
                >
                  Отклонить
                </button>

                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionReturn}`}
                  onClick={() => showToast("Пока не подключено")}
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
                    {listing.seller.totalListings} объявлений · на площадке
                    с {listing.seller.registeredAt}
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
      </main>
    </div>
  );
};
