import React from "react";
import { Link } from "react-router-dom";
import { Header } from "../../shared/layout/Header";
import { SidebarFilters } from "../../shared/layout/SidebarFilters";
import {
  ListingCard,
  type Listing,
} from "../../shared/listing/ListingCard";
import styles from "./ListingsPage.module.scss";

const mockListings: Listing[] = [
  {
    id: 1,
    title: "Игровой ноутбук для учебы и работы",
    price: "89 000 ₽",
    category: "Электроника",
    status: "pending",
    priority: "urgent",
    createdAt: "сегодня, 12:30",
    image: "https://via.placeholder.com/320x200",
  },
  {
    id: 2,
    title: "Стол рабочий + кресло",
    price: "12 500 ₽",
    category: "Мебель",
    status: "approved",
    priority: "normal",
    createdAt: "вчера, 19:10",
    image: "https://via.placeholder.com/320x200",
  },
  {
    id: 3,
    title: 'Монитор 27" IPS 144 Hz',
    price: "24 900 ₽",
    category: "Электроника",
    status: "rejected",
    priority: "normal",
    createdAt: "2 дня назад",
    image: "https://via.placeholder.com/320x200",
  },
  {
    id: 4,
    title: "Смартфон с отличной камерой",
    price: "34 000 ₽",
    category: "Электроника",
    status: "pending",
    priority: "normal",
    createdAt: "сегодня, 09:05",
    image: "https://via.placeholder.com/320x200",
  },
];

export const ListingsPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <SidebarFilters />

        <section className={styles.content}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <h1 className={styles.title}>Лента модерации</h1>
              <span className={styles.meta}>
                Найдено {mockListings.length} объявлений
              </span>
            </div>

            <div className={styles.toolbarRight}>
              <label className={styles.sortControl}>
                <span className={styles.sortLabel}>Сортировка:</span>
                <select className={styles.sortSelect}>
                  <option>По дате — новые сверху</option>
                  <option>По дате — старые сверху</option>
                  <option>По цене — по возрастанию</option>
                  <option>По цене — по убыванию</option>
                  <option>По приоритету</option>
                </select>
              </label>

              <div className={styles.viewToggle}>
                <button
                  type="button"
                  className={`${styles.viewButton} ${styles.viewButtonActive}`}
                >
                  ⬛
                </button>
                <button type="button" className={styles.viewButton}>
                  ☰
                </button>
              </div>
            </div>
          </div>

          <div className={styles.grid}>
            {mockListings.map((item) => (
              <Link
                key={item.id}
                to={`/item/${item.id}`}
                className={styles.cardLink}
              >
                <ListingCard item={item} />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
