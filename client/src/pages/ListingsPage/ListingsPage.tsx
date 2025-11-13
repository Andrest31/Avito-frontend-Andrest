import React from "react";
import { Header } from "../../shared/layout/Header";
import { SidebarFilters } from "../../shared/layout/SidebarFilters";
import { ListingCard, type Listing } from "../../shared/listing/ListingCard";
import styles from "./ListingsPage.module.scss";

const mockListings: Listing[] = [
  {
    id: 1,
    title: "Игровой ноутбук для учебы и работы",
    price: "89 000 ₽",
    location: "Москва, м. Бауманская",
    date: "сегодня, 12:30",
    image: "https://via.placeholder.com/320x200",
    badge: "Топ-объявление",
  },
  {
    id: 2,
    title: "Стол рабочий + кресло",
    price: "12 500 ₽",
    location: "Москва, м. Авиамоторная",
    date: "вчера, 19:10",
    image: "https://via.placeholder.com/320x200",
  },
  {
    id: 3,
    title: "Монитор 27\" IPS 144 Hz",
    price: "24 900 ₽",
    location: "Химки",
    date: "2 дня назад",
    image: "https://via.placeholder.com/320x200",
    badge: "Новое",
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
              <h1 className={styles.title}>Объявления</h1>
              <span className={styles.meta}>
                Найдено {mockListings.length} объявлений
              </span>
            </div>

            <div className={styles.toolbarRight}>
              <label className={styles.sortControl}>
                <span className={styles.sortLabel}>Сортировать:</span>
                <select className={styles.sortSelect}>
                  <option>По умолчанию</option>
                  <option>Сначала дешевле</option>
                  <option>Сначала дороже</option>
                  <option>По дате</option>
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
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
