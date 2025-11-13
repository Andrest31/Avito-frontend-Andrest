import React from "react";
import { Header } from "../../shared/layout/Header";
import styles from "./StatsPage.module.scss";

const stats = {
  totalToday: 34,
  totalWeek: 210,
  totalMonth: 820,
  approvedPercent: 68,
  rejectedPercent: 22,
  reworkPercent: 10,
  avgReviewTime: "01:45",
  dailyActivity: [
    { day: "Пн", value: 18 },
    { day: "Вт", value: 24 },
    { day: "Ср", value: 30 },
    { day: "Чт", value: 27 },
    { day: "Пт", value: 22 },
    { day: "Сб", value: 12 },
    { day: "Вс", value: 7 },
  ],
  decisions: [
    { label: "Одобрено", value: 68 },
    { label: "Отклонено", value: 22 },
    { label: "На доработку", value: 10 },
  ],
  categories: [
    { label: "Электроника", value: 40 },
    { label: "Мебель", value: 18 },
    { label: "Одежда", value: 12 },
    { label: "Услуги", value: 30 },
  ],
};

export const StatsPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <header className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <h1 className={styles.title}>Статистика модератора</h1>
            <p className={styles.subtitle}>
              Сводка по проверенным объявлениям и эффективности работы.
            </p>
          </div>
          <div className={styles.toolbarRight}>
            <div className={styles.periodSwitch}>
              {/* Просто верстка, без логики фильтрации */}
              <button
                type="button"
                className={`${styles.periodButton} ${styles.periodButtonActive}`}
              >
                Сегодня
              </button>
              <button type="button" className={styles.periodButton}>
                Последние 7 дней
              </button>
              <button type="button" className={styles.periodButton}>
                Последние 30 дней
              </button>
            </div>
          </div>
        </header>

        <section className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Проверено сегодня</span>
            <span className={styles.metricValue}>{stats.totalToday}</span>
            <span className={styles.metricHint}>
              За неделю: {stats.totalWeek}, за месяц: {stats.totalMonth}
            </span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Одобрено</span>
            <span className={styles.metricValue}>
              {stats.approvedPercent}%
            </span>
            <span className={styles.metricHint}>
              Доля одобренных от всех решений
            </span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Отклонено</span>
            <span className={styles.metricValue}>
              {stats.rejectedPercent}%
            </span>
            <span className={styles.metricHint}>Включая нарушения правил</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>
              Среднее время проверки
            </span>
            <span className={styles.metricValue}>{stats.avgReviewTime}</span>
            <span className={styles.metricHint}>
              От открытия карточки до принятия решения
            </span>
          </div>
        </section>

        <section className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>
              Активность по дням (последняя неделя)
            </h2>
            <div className={styles.barChart}>
              {stats.dailyActivity.map((item) => (
                <div key={item.day} className={styles.barColumn}>
                  <div
                    className={styles.bar}
                    style={{ height: `${item.value * 3}px` }}
                  />
                  <span className={styles.barLabel}>{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>
              Распределение решений модерации
            </h2>
            <div className={styles.pieRow}>
              <div className={styles.pieStub} />
              <ul className={styles.legend}>
                {stats.decisions.map((item, index) => (
                  <li key={item.label} className={styles.legendItem}>
                    <span
                      className={`${styles.legendDot} ${styles[`legendDot${index + 1}`]}`}
                    />
                    <span className={styles.legendLabel}>{item.label}</span>
                    <span className={styles.legendValue}>
                      {item.value}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>
              Проверенные объявления по категориям
            </h2>
            <div className={styles.categoriesChart}>
              {stats.categories.map((item) => (
                <div key={item.label} className={styles.categoryRow}>
                  <span className={styles.categoryLabel}>{item.label}</span>
                  <div className={styles.categoryBarWrapper}>
                    <div
                      className={styles.categoryBar}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className={styles.categoryValue}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
