import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../../shared/layout/Header";
import styles from "./ListingDetailsPage.module.scss";
import { adsApi, type Advertisement } from "../../api/ads";

// ---------- Тип нормализованного объявления под текущий UI ----------
type NormalizedHistoryItem = {
  id: number;
  moderator: string;
  decision: "approved" | "rejected" | "returned";
  dateISO: string;
  comment: string;
};

type NormalizedCharacteristic = {
  key: string;
  value: string;
};

type NormalizedSeller = {
  name: string;
  rating: number;
  totalListings: number;
  registeredAt: string;
};

type NormalizedListing = {
  id: number;
  title: string;
  description: string;
  price: string;
  category: string;
  status: Advertisement["status"];
  priority: Advertisement["priority"];
  createdAt: string;
  views: number;
  gallery: string[];
  characteristics: NormalizedCharacteristic[];
  seller: NormalizedSeller;
  moderationHistory: NormalizedHistoryItem[];
};

// ---------- Лейблы статусов ----------
const statusLabel: Record<Advertisement["status"], string> = {
  pending: "На модерации",
  approved: "Одобрено",
  rejected: "Отклонено",
  draft: "Черновик",
};

// ---------- Нормализация ответа API под твой UI ----------
function normalizeAd(ad: Advertisement): NormalizedListing {
  const randomViews = Math.floor(Math.random() * (120 - 5 + 1)) + 5;

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
    views: randomViews,
    gallery: ad.images && ad.images.length ? ad.images : ["/placeholder.png"],
    characteristics: Object.entries(ad.characteristics || {}).map(
      ([key, value]) => ({
        key,
        value,
      })
    ),
    seller: {
      name: ad.seller.name,
      rating: Number(ad.seller.rating) || 0,
      totalListings: ad.seller.totalAds,
      registeredAt: new Date(ad.seller.registeredAt).toLocaleDateString(
        "ru-RU"
      ),
    },
    moderationHistory: (ad.moderationHistory || []).map((h) => ({
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

export const ListingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const numericId = Number(id);

  // одно объявление
  const [adRaw, setAdRaw] = useState<Advertisement | null>(null);
  const [loadingAd, setLoadingAd] = useState(true);
  const [adError, setAdError] = useState<string | null>(null);

  // все id объявлений (для prev/next)
  const [allIds, setAllIds] = useState<number[]>([]);
  const [loadingIds, setLoadingIds] = useState(true);

  // галерея
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // тост
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // ---------- загрузка одного объявления ----------
  useEffect(() => {
    if (!id || Number.isNaN(numericId)) return;

    const controller = new AbortController();

    adsApi
      .getById(numericId)
      .then((data) => {
        setAdRaw(data);
        setAdError(null);
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) => {
        if (err.name === "AbortError") return;
        console.error(err);
        setAdError(err.message ?? "Ошибка загрузки объявления");
      })
      .finally(() => {
        setLoadingAd(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericId]);

  // ---------- загрузка списка объявлений для prev/next ----------
  useEffect(() => {
    const controller = new AbortController();

    adsApi
      .getAll(controller.signal)
      .then((res) => {
        const ids = res.ads.map((item) => item.id);
        setAllIds(ids);
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) => {
        if (err.name === "AbortError") return;
        console.error("Ошибка загрузки списка объявлений:", err);
      })
      .finally(() => setLoadingIds(false));

    return () => controller.abort();
  }, []);

  // ---------- тост ----------
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // ---------- нормализованное объявление ----------
  const listing: NormalizedListing | null = adRaw ? normalizeAd(adRaw) : null;

  // ---------- prev / next ----------
  const currentIndex = useMemo(() => {
    if (!allIds.length || Number.isNaN(numericId)) return -1;
    return allIds.indexOf(numericId);
  }, [allIds, numericId]);

  const prevId =
    currentIndex > 0 && currentIndex !== -1
      ? allIds[currentIndex - 1]
      : undefined;

  const nextId =
    currentIndex !== -1 && currentIndex < allIds.length - 1
      ? allIds[currentIndex + 1]
      : undefined;

  const handleNav = (targetId?: number) => {
    if (!targetId) return;
    navigate(`/item/${targetId}`);
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    });

  // ---------- состояние загрузки / ошибки / отсутствие ----------
  if (loadingAd) {
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
          <div className={styles.card}>Загрузка объявления…</div>
        </main>
      </div>
    );
  }

  if (adError || !listing) {
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
          <div className={styles.card}>
            {adError ?? "Объявление не найдено."}
          </div>
        </main>
      </div>
    );
  }

  const historySorted = [...listing.moderationHistory].sort(
    (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
  );

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
                      key={`${src}-${idx}`}
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
                        <td className={styles.characteristicsKey}>{row.key}</td>
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
                        <p className={styles.historyComment}>{item.comment}</p>
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
                  POST-экшены подключим следующим шагом
                </span>
              </div>

              <div className={styles.moderationButtons}>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionApprove}`}
                  onClick={() => showToast("Пока без API — только просмотр")}
                >
                  Одобрить
                </button>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionReject}`}
                  onClick={() => showToast("Пока без API — только просмотр")}
                >
                  Отклонить
                </button>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionReturn}`}
                  onClick={() => showToast("Пока без API — только просмотр")}
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
                  <div className={styles.sellerName}>{listing.seller.name}</div>
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
                disabled={prevId === undefined || loadingIds}
                onClick={() => handleNav(prevId)}
              >
                ← Предыдущее
              </button>

              <button
                type="button"
                className={styles.navButton}
                disabled={nextId === undefined || loadingIds}
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
