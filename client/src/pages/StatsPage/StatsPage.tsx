import React, { useEffect, useMemo, useState } from "react";
import { Header } from "../../shared/layout/Header";
import styles from "./StatsPage.module.scss";
import { Card, ToggleButtonGroup, ToggleButton } from "@mui/material";
import {
  statsApi,
  type Period,
  type ActivityPoint,
  type StatsSummaryResponse,
} from "../../api/stats";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Сегодня",
  week: "Последние 7 дней",
  month: "Последние 30 дней",
};

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

type NormalizedStats = {
  totalToday: number;
  totalWeek: number;
  totalMonth: number;
  approvedPercent: number;
  rejectedPercent: number;
  reworkPercent: number;
  avgReviewTime: string;
  dailyActivity: { day: string; value: number }[];
  decisions: { label: string; value: number }[];
  categories: { label: string; value: number }[];
};

// ---------- форматирование / нормализация ----------

// backend шлёт averageReviewTime в СЕКУНДАХ
function formatAverageTime(raw: number): string {
  if (!raw || raw <= 0) return "—";
  const totalSeconds = Math.round(raw);
  const minutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function normalizeActivity(points: ActivityPoint[]): {
  day: string;
  value: number;
}[] {
  const counts = new Array(7).fill(0) as number[];

  points.forEach((p) => {
    const date = new Date(p.date);
    if (Number.isNaN(date.getTime())) return;

    const dow = date.getDay(); // 0 — Вс ... 6 — Сб
    const idx = dow === 0 ? 6 : dow - 1;

    const total =
      (p.approved || 0) + (p.rejected || 0) + (p.requestChanges || 0);
    counts[idx] += total;
  });

  return DAY_LABELS.map((day, idx) => ({
    day,
    value: counts[idx],
  }));
}

function buildNormalizedStats(
  summary: StatsSummaryResponse | null,
  activity: ActivityPoint[]
): NormalizedStats {
  const safeSummary: StatsSummaryResponse =
    summary ??
    ({
      totalReviewed: 0,
      totalReviewedToday: 0,
      totalReviewedThisWeek: 0,
      totalReviewedThisMonth: 0,
      approvedPercentage: 0,
      rejectedPercentage: 0,
      requestChangesPercentage: 0,
      averageReviewTime: 0,
    } as StatsSummaryResponse);

  const dailyActivity = normalizeActivity(activity);

  // распределение решений просто берём из процентов summary
  const decisions = [
    { label: "Одобрено", value: Math.round(safeSummary.approvedPercentage) },
    { label: "Отклонено", value: Math.round(safeSummary.rejectedPercentage) },
    {
      label: "На доработку",
      value: Math.round(safeSummary.requestChangesPercentage),
    },
  ];

  // категории пока пустые — честно покажем сообщение
  const categories: { label: string; value: number }[] = [];

  return {
    totalToday: safeSummary.totalReviewedToday,
    totalWeek: safeSummary.totalReviewedThisWeek,
    totalMonth: safeSummary.totalReviewedThisMonth,
    approvedPercent: safeSummary.approvedPercentage,
    rejectedPercent: safeSummary.rejectedPercentage,
    reworkPercent: safeSummary.requestChangesPercentage,
    avgReviewTime: formatAverageTime(safeSummary.averageReviewTime),
    dailyActivity,
    decisions,
    categories,
  };
}

// ---------- компонент ----------

export const StatsPage: React.FC = () => {
  // по умолчанию логичнее смотреть неделю
  const [period, setPeriod] = useState<Period>("week");

  const [summary, setSummary] = useState<StatsSummaryResponse | null>(null);
  const [activity, setActivity] = useState<ActivityPoint[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    // 2 независимых запроса, без Promise.all — меньше шансов всё уронить
    statsApi
      .getSummary(period, controller.signal)
      .then((data) => {
        setSummary(data);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("summary error", err);
        setError("Не удалось загрузить графики статистики");
        setSummary(null);
      });

    statsApi
      .getActivity(period, controller.signal)
      .then((data) => {
        setActivity(data || []);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("activity error", err);
        setError("Не удалось загрузить графики статистики");
        setActivity([]);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [period]);

  const stats = useMemo(
    () => buildNormalizedStats(summary, activity),
    [summary, activity]
  );

  const handlePeriodChange = (
    _: React.MouseEvent<HTMLElement>,
    value: Period | null
  ) => {
    if (!value || value === period) return;
    setPeriod(value);
  };

  const downloadFile = (content: BlobPart, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const lines: string[][] = [];

    const addRow = (...cols: (string | number)[]) => {
      lines.push(cols.map((c) => String(c)));
    };

    addRow("Период", PERIOD_LABELS[period]);
    addRow("");
    addRow("Общие показатели", "");
    addRow("Проверено сегодня", stats.totalToday);
    addRow("Проверено за 7 дней", stats.totalWeek);
    addRow("Проверено за 30 дней", stats.totalMonth);
    addRow("Среднее время проверки", stats.avgReviewTime);
    addRow("");
    addRow("Распределение решений", "");
    stats.decisions.forEach((d) => addRow(d.label, `${d.value}%`));
    addRow("");
    addRow("Категории", "Доля, %");
    stats.categories.forEach((c) => addRow(c.label, c.value));

    const csv = lines
      .map((row) =>
        row
          .map((cell) => {
            const safe = cell.replace(/"/g, '""');
            return `"${safe}"`;
          })
          .join(";")
      )
      .join("\r\n");

    downloadFile(
      csv,
      `moderation-stats-${period}.csv`,
      "text/csv;charset=utf-8;"
    );
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => (window.location.href = "/list")}
        >
          ← Назад
        </button>
        <header className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <h1 className={styles.title}>Статистика модератора</h1>
            <p className={styles.subtitle}>
              Сводка по проверенным объявлениям и эффективности работы.
            </p>
            {error && (
              <div className={styles.errorBanner}>{error}</div>
            )}
          </div>
          <div className={styles.toolbarRight}>
            <div className={styles.exportGroup}>
              <button
                type="button"
                className={`${styles.exportButton} ${styles.exportButtonCsv}`}
                onClick={handleExportCsv}
                disabled={loading}
              >
                Экспорт CSV
              </button>
            </div>

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
            <span className={styles.metricValue}>
              {Math.round(stats.approvedPercent)}%
            </span>
            <span className={styles.metricHint}>
              Доля одобренных от всех решений
            </span>
          </Card>

          <Card className={styles.metricCard} elevation={0}>
            <span className={styles.metricLabel}>Отклонено</span>
            <span className={styles.metricValue}>
              {Math.round(stats.rejectedPercent)}%
            </span>
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
                    #ef4444 ${stats.decisions[0].value * 3.6}deg ${
                      (stats.decisions[0].value + stats.decisions[1].value) *
                      3.6
                    }deg,
                    #facc15 ${
                      (stats.decisions[0].value + stats.decisions[1].value) *
                      3.6
                    }deg 360deg
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
              {stats.categories.length === 0 ? (
                <div className={styles.emptyCategories}>
                  Недостаточно данных по категориям
                </div>
              ) : (
                stats.categories.map((item) => (
                  <div key={item.label} className={styles.categoryRow}>
                    <span className={styles.categoryLabel}>{item.label}</span>
                    <div className={styles.categoryBarWrapper}>
                      <div
                        className={styles.categoryBar}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className={styles.categoryValue}>
                      {item.value}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};
