import React from "react";
import styles from "./ListingCard.module.scss";

export type Listing = {
  id: number;
  title: string;
  price: string;
  location: string;
  date: string;
  image: string;
  badge?: string;
};

type Props = {
  item: Listing;
};

export const ListingCard: React.FC<Props> = ({ item }) => {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={item.image} alt={item.title} className={styles.image} />
        {item.badge && <span className={styles.badge}>{item.badge}</span>}
      </div>
      <div className={styles.body}>
        <h2 className={styles.title}>{item.title}</h2>
        <div className={styles.priceRow}>
          <span className={styles.price}>{item.price}</span>
          <button type="button" className={styles.favorite}>
            ♡
          </button>
        </div>
        <div className={styles.meta}>
          <span>{item.location}</span>
          <span className={styles.dot}>•</span>
          <span>{item.date}</span>
        </div>
      </div>
    </article>
  );
};
