import React from "react";
import styles from "./ListingCard.module.scss";

export type ModerationStatus = "pending" | "approved" | "rejected";
export type Priority = "normal" | "urgent";

export type Listing = {
  id: number;
  title: string;
  price: string;
  category: string;
  status: ModerationStatus;
  priority: Priority;
  createdAt: string;
  image: string;
};

type Props = {
  item: Listing;
};

const statusLabel: Record<ModerationStatus, string> = {
  pending: "На модерации",
  approved: "Одобрено",
  rejected: "Отклонено",
};

export const ListingCard: React.FC<Props> = ({ item }) => {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={item.image} alt={item.title} className={styles.image} />
        <div className={styles.statusPills}>
          <span
            className={`${styles.status} ${styles[`status_${item.status}`]}`}
          >
            {statusLabel[item.status]}
          </span>
          <span
            className={`${styles.priority} ${
              item.priority === "urgent" ? styles.priorityUrgent : ""
            }`}
          >
            {item.priority === "urgent" ? "Срочное" : "Обычное"}
          </span>
        </div>
      </div>

      <div className={styles.body}>
        <h2 className={styles.title}>{item.title}</h2>

        <div className={styles.metaTop}>
          <span className={styles.price}>{item.price}</span>
        </div>

        <div className={styles.metaBottom}>
          <span>{item.category}</span>
          <span className={styles.dot}>•</span>
          <span>{item.createdAt}</span>
        </div>
      </div>
    </article>
  );
};
