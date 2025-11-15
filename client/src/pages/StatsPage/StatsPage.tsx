import React, { useMemo, useState } from "react";
import { Header } from "../../shared/layout/Header";
import styles from "./StatsPage.module.scss";
import {
  getInitialListings,
  type ListingWithMeta,
  type ModerationHistoryItem,
} from "../../shared/listing/mockListings";

import { Card, ToggleButtonGroup, ToggleButton } from "@mui/material";

type Period = "today" | "week" | "month";

type Summary = {
  total: number;
  approvedPercent: number;
  rejectedPercent: number;
  reworkPercent: number;
  avgReviewTime: string;
  dailyActivity: { day: string; value: number }[];
  decisions: { label: string; value: number }[];
  categories: { label: string; value: number }[];
};

type ModeratedItem = {
  listing: ListingWithMeta;
  first: ModerationHistoryItem;
  last: ModerationHistoryItem;
};

const PERIOD_LABELS: Record<Period, string> = {
  today: "Сегодня",
  week: "Последние 7 дней",
  month: "Последние 30 дней",
};

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function isInPeriod(dateISO: string, period: Period): boolean {
  const now = new Date();
  const date = new Date(dateISO);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (period === "today") return diffDays <= 1;
  if (period === "week") return diffDays <= 7;
  return diffDays <= 30;
}

function computeSummary(listings: ListingWithMeta[], period: Period): Summary {
  const moderated: ModeratedItem[] = listings
    .map<ModeratedItem | null>((listing) => {
      const history = listing.moderationHistory;
      if (!history.length) return null;
      const first = history[0];
      const last = history[history.length - 1];
      return { listing, first, last };
    })
    .filter((x): x is ModeratedItem => x !== null)
    .filter(({ last }) => isInPeriod(last.dateISO, period));

  const total = moderated.length;

  let approved = 0;
  let rejected = 0;
  let rework = 0;

  const perAdMinutes: number[] = [];
  const categoryCounts = new Map<string, number>();
  const daysCounts = new Array(7).fill(0) as number[];

  moderated.forEach(({ listing, first, last }) => {
    if (listing.status === "approved") approved++;
    if (listing.status === "rejected") rejected++;
    if (listing.status === "pending") rework++;

    categoryCounts.set(
      listing.category,
      (categoryCounts.get(listing.category) || 0) + 1
    );

    const start = new Date(first.dateISO).getTime();
    const end = new Date(last.dateISO).getTime();
    const minutes = Math.max(1, Math.round((end - start) / (1000 * 60)));
    perAdMinutes.push(minutes);

    const dow = new Date(last.dateISO).getDay(); // 0 — Вс
    const idx = dow === 0 ? 6 : dow - 1;
    daysCounts[idx] += 1;
  });

  const avgMinutes =
    perAdMinutes.length === 0
      ? 0
      : Math.round(
          perAdMinutes.reduce((sum, v) => sum + v, 0) / perAdMinutes.length
        );

  const hours = Math.floor(avgMinutes / 60);
  const mins = avgMinutes % 60;
  const avgReviewTime =
    avgMinutes === 0
      ? "—"
      : `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

  const approvedPercent = total ? Math.round((approved / total) * 100) : 0;
  const rejectedPercent = total ? Math.round((rejected / total) * 100) : 0;
  const reworkPercent = total ? Math.round((rework / total) * 100) : 0;

  const dailyActivity = DAY_LABELS.map((day, idx) => ({
    day,
    value: daysCounts[idx],
  }));

  const decisions = [
    { label: "Одобрено", value: approvedPercent },
    { label: "Отклонено", value: rejectedPercent },
    { label: "На доработку", value: reworkPercent },
  ];

  const categories: { label: string; value: number }[] = [];
  categoryCounts.forEach((count, category) => {
    const percent = total ? Math.round((count / total) * 100) : 0;
    categories.push({ label: category, value: percent });
  });

  return {
    total,
    approvedPercent,
    rejectedPercent,
    reworkPercent,
    avgReviewTime,
    dailyActivity,
    decisions,
    categories,
  };
}

export const StatsPage: React.FC = () => {
  const [listings] = useState<ListingWithMeta[]>(() => getInitialListings());
  const [period, setPeriod] = useState<Period>("today");

  const summariesByPeriod = useMemo(() => {
    return {
      today: computeSummary(listings, "today"),
      week: computeSummary(listings, "week"),
      month: computeSummary(listings, "month"),
    };
  }, [listings]);

  const current = summariesByPeriod[period];

  const stats = {
    totalToday: summariesByPeriod.today.total,
    totalWeek: summariesByPeriod.week.total,
    totalMonth: summariesByPeriod.month.total,
    approvedPercent: current.approvedPercent,
    rejectedPercent: current.rejectedPercent,
    reworkPercent: current.reworkPercent,
    avgReviewTime: current.avgReviewTime,
    dailyActivity: current.dailyActivity,
    decisions: current.decisions,
    categories: current.categories,
  };

  const handlePeriodChange = (
    _: React.MouseEvent<HTMLElement>,
    value: Period | null
  ) => {
    if (value) setPeriod(value);
  };

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
            <ToggleButtonGroup
              className={styles.periodSwitch}
              value={period}
              exclusive
              onChange={handlePeriodChange}
            >
              {(Object.keys(PERIOD_LABELS) as Period[]).map((key) => (
                <ToggleButton
                  key={key}
                  value={key}
                  className={`${styles.periodButton} ${
                    period === key ? styles.periodButtonActive : ""
                  }`}
                >
                  {PERIOD_LABELS[key]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
        </header>

        <section className={styles.metricsGrid}>
          <Card className={styles.metricCard} elevation={0}>
            <span className={styles.metricLabel}>Проверено сегодня</span>
            <span className={styles.metricValue}>{stats.totalToday}</span>
            <span className={styles.metricHint}>
              За неделю: {stats.totalWeek}, за месяц: {stats.totalMonth}
            </span>
          </Card>

          <Card className={styles.metricCard} elevation={0}>
            <span className={styles.metricLabel}>Одобрено</span>
            <span className={styles.metricValue}>{stats.approvedPercent}%</span>
            <span className={styles.metricHint}>
              Доля одобренных от всех решений
            </span>
          </Card>

          <Card className={styles.metricCard} elevation={0}>
            <span className={styles.metricLabel}>Отклонено</span>
            <span className={styles.metricValue}>{stats.rejectedPercent}%</span>
            <span className={styles.metricHint}>Включая нарушения правил</span>
          </Card>

          <Card className={styles.metricCard} elevation={0}>
            <span className={styles.metricLabel}>Среднее время проверки</span>
            <span className={styles.metricValue}>{stats.avgReviewTime}</span>
            <span className={styles.metricHint}>
              От открытия карточки до принятия решения
            </span>
          </Card>
        </section>

        <section className={styles.chartsGrid}>
          <Card className={styles.chartCard} elevation={0}>
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
          </Card>

          <Card className={styles.chartCard} elevation={0}>
            <h2 className={styles.chartTitle}>
              Распределение решений модерации
            </h2>
            <div className={styles.pieRow}>
              <div
                className={styles.pieStub}
                style={{
                  background: `conic-gradient(
          #22c55e 0deg ${stats.decisions[0].value * 3.6}deg,
          #ef4444 ${stats.decisions[0].value * 3.6}deg ${(stats.decisions[0].value + stats.decisions[1].value) * 3.6}deg,
          #facc15 ${(stats.decisions[0].value + stats.decisions[1].value) * 3.6}deg 360deg
        )`,
                }}
              >
                <div className={styles.pieInner} />
              </div>

              <ul className={styles.legend}>
                {stats.decisions.map((item, index) => (
                  <li key={item.label} className={styles.legendItem}>
                    <span
                      className={`${styles.legendDot} ${
                        styles[`legendDot${index + 1}`]
                      }`}
                    />
                    <span className={styles.legendLabel}>{item.label}</span>
                    <span className={styles.legendValue}>{item.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card className={styles.chartCard} elevation={0}>
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
          </Card>
        </section>
      </main>
    </div>
  );
};
