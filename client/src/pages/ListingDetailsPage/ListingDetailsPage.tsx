import React from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../shared/layout/Header";
import styles from "./ListingDetailsPage.module.scss";

type ModerationDecision = "approved" | "rejected" | "returned";

type ModerationHistoryItem = {
  id: number;
  moderator: string;
  decision: ModerationDecision;
  date: string;
  comment?: string;
};

type Characteristic = {
  key: string;
  value: string;
};

type SellerInfo = {
  name: string;
  rating: number;
  totalListings: number;
  registeredAt: string;
};

type ListingDetails = {
  id: number;
  title: string;
  price: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  priority: "normal" | "urgent";
  createdAt: string;
  description: string;
  gallery: string[];
  views: number;
  seller: SellerInfo;
  characteristics: Characteristic[];
  moderationHistory: ModerationHistoryItem[];
};

const mockListing: ListingDetails = {
  id: 1,
  title: "Игровой ноутбук для учебы и работы",
  price: "89 000 ₽",
  category: "Электроника",
  status: "pending",
  priority: "urgent",
  createdAt: "сегодня, 12:30",
  description:
    "Мощный игровой ноутбук в идеальном состоянии. Использовался аккуратно, без ремонтов. Подходит как для учебы и работы, так и для игр. Процессор i7, 16 ГБ ОЗУ, SSD 512 ГБ, видеокарта RTX 3060.",
  gallery: [
    "https://via.placeholder.com/900x600",
    "https://via.placeholder.com/220x160",
    "https://via.placeholder.com/220x160",
    "https://via.placeholder.com/220x160",
  ],
  views: 124,
  seller: {
    name: "Иван",
    rating: 4.8,
    totalListings: 32,
    registeredAt: "апрель 2021",
  },
  characteristics: [
    { key: "Состояние", value: "Б/у" },
    { key: "Экран", value: '15.6", IPS, 144 Гц' },
    { key: "Процессор", value: "Intel Core i7" },
    { key: "ОЗУ", value: "16 ГБ" },
    { key: "Накопитель", value: "SSD 512 ГБ" },
    { key: "Видеокарта", value: "RTX 3060" },
  ],
  moderationHistory: [
    {
      id: 1,
      moderator: "Алексей П.",
      decision: "returned",
      date: "12.11.2025, 10:14",
      comment: "Уточните модель видеокарты и объем SSD в описании.",
    },
    {
      id: 2,
      moderator: "Мария К.",
      decision: "approved",
      date: "12.11.2025, 10:27",
      comment: "Описание дополнено, нарушений не обнаружено.",
    },
  ],
};

const statusLabel = {
  pending: "На модерации",
  approved: "Одобрено",
  rejected: "Отклонено",
};

const decisionLabel: Record<ModerationDecision, string> = {
  approved: "Одобрено",
  rejected: "Отклонено",
  returned: "На доработку",
};

export const ListingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const listing = mockListing;

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

        <header className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>{listing.title}</h1>

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
                  : "Обычный приоритет"}
              </span>
            </div>

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
                  src={listing.gallery[0]}
                  alt={listing.title}
                  className={styles.mainImage}
                />
                <div className={styles.thumbnails}>
                  {listing.gallery.slice(1).map((src, index) => (
                    <button
                      key={index}
                      type="button"
                      className={styles.thumbnailButton}
                    >
                      <img
                        src={src}
                        alt={`${listing.title} ${index + 2}`}
                        className={styles.thumbnail}
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
                {listing.moderationHistory.map((item, idx) => (
                  <li key={item.id} className={styles.historyItem}>
                    <div className={styles.historyBullet} />
                    <div className={styles.historyContent}>
                      <div className={styles.historyTopRow}>
                        <span className={styles.historyModerator}>
                          {item.moderator}
                        </span>
                        <span className={styles.historyDecision}>
                          {decisionLabel[item.decision]}
                        </span>
                        <span className={styles.historyDate}>{item.date}</span>
                      </div>
                      {item.comment && (
                        <p className={styles.historyComment}>{item.comment}</p>
                      )}
                    </div>
                    {idx !== listing.moderationHistory.length - 1 && (
                      <div className={styles.historyLine} />
                    )}
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
                  Применится только после выбора действия
                </span>
              </div>

              <div className={styles.moderationButtons}>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionApprove}`}
                >
                  Одобрить
                </button>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionReject}`}
                >
                  Отклонить
                </button>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionReturn}`}
                >
                  Вернуть на доработку
                </button>
              </div>

              <div className={styles.reasonBlock}>
                <span className={styles.reasonLabel}>Причина отклонения</span>
                <div className={styles.reasonTemplates}>
                  {[
                    "Запрещённый товар",
                    "Неверная категория",
                    "Некорректное описание",
                    "Проблемы с фото",
                    "Подозрение на мошенничество",
                    "Другое",
                  ].map((template) => (
                    <button
                      key={template}
                      type="button"
                      className={styles.reasonChip}
                    >
                      {template}
                    </button>
                  ))}
                </div>
                <textarea
                  className={styles.reasonInput}
                  rows={4}
                  placeholder="Опишите детали для продавца"
                />
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.sellerHeader}>
                <div className={styles.sellerAvatar}>И</div>
                <div>
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
              <button type="button" className={styles.navButton}>
                ← Предыдущее
              </button>
              <button type="button" className={styles.navButton}>
                Следующее →
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
