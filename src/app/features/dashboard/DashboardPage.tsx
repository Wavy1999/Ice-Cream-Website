// ============================================================
//  DashboardPage  –  Analytics overview (ice cream theme)
// ============================================================

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { inventoryService } from "../../core/services/InventoryService";
import { salesService } from "../../core/services/SalesService";
import { ordersService } from "../../core/services/OrdersService";
import { useAppStore } from "../../core/providers/AppStore";
import type { DashboardStats } from "../../shared/types";
import styles from "./DashboardPage.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// ── Flavor palette (matches CSS vars) ──────────────────────
const FLAVORS = {
  strawberry: { bg: "#fce7f3", color: "#db2777", icon: "fa-ice-cream" },
  mint: { bg: "#E1F5EE", color: "#0F6E56", icon: "fa-ice-cream" },
  vanilla: { bg: "#FAEEDA", color: "#854F0B", icon: "fa-ice-cream" },
  ube: { bg: "#EEEDFE", color: "#534AB7", icon: "fa-ice-cream" },
  cherry: { bg: "#fce7f3", color: "#E8485A", icon: "fa-ice-cream" },
} as const;

type FlavorKey = keyof typeof FLAVORS;

// ── Stats Card ─────────────────────────────────────────────
interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  flavor?: FlavorKey;
  delay?: number;
  testId?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  sub,
  flavor = "strawberry",
  delay = 0,
  testId,
}) => {
  const { bg, color } = FLAVORS[flavor];
  return (
    <div
      className={styles.statCard}
      style={{ animationDelay: `${delay}s` }}
      data-testid={testId}
    >
      <div
        className={styles.statIcon}
        style={{ background: bg, color, animationDelay: `${delay + 0.4}s` }}
      >
        <i className={`fa-solid ${icon}`} />
      </div>
      <div className={styles.statBody}>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue} data-testid={`${testId}-value`}>
          {value}
        </div>
        {sub && <div className={styles.statSub}>{sub}</div>}
      </div>
    </div>
  );
};

// ── Status pill ────────────────────────────────────────────
const STATUS_PILL: Record<string, string> = {
  pending: styles["pill--pending"],
  preparing: styles["pill--preparing"],
  delivered: styles["pill--delivered"],
  completed: styles["pill--delivered"],
};

// ── Main Page ──────────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const { farm, settings, darkMode } = useAppStore((s) => ({
    farm: s.farm,
    settings: s.settings,
    darkMode: s.darkMode,
  }));

  const farmId = farm?.id ?? "";
  const threshold = settings?.low_stock_threshold ?? 15;

  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory", farmId],
    queryFn: () => inventoryService.list(farmId).then((r) => r.data ?? []),
    enabled: !!farmId,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ["sales", farmId],
    queryFn: () => salesService.list(farmId).then((r) => r.data ?? []),
    enabled: !!farmId,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", farmId],
    queryFn: () => ordersService.list(farmId).then((r) => r.data ?? []),
    enabled: !!farmId,
  });

  const stats: DashboardStats = useMemo(
    () => ({
      totalProducts: inventory.length,
      totalInventoryValue: inventory.reduce((s, i) => s + i.total_value, 0),
      totalSalesRevenue: salesService.getTotalRevenue(sales),
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      lowStockCount: inventory.filter((i) => i.status === "low-stock").length,
      outOfStockCount: inventory.filter((i) => i.status === "out-of-stock")
        .length,
    }),
    [inventory, sales, orders],
  );

  const salesByDay = useMemo(
    () => salesService.getSalesByDay(sales.slice(0, 30)),
    [sales],
  );

  // ── Chart colours – ice cream palette ──
  const chartColors = {
    grid: darkMode ? "rgba(255,255,255,0.06)" : "#fce7f3",
    text: darkMode ? "#F4C0D1" : "#be185d",
    line: "#ec4899",
    fill: darkMode ? "rgba(236,72,153,0.18)" : "rgba(236,72,153,0.10)",
    bars: ["#F9A8C9", "#B5E5D0", "#FDDCAB", "#AFA9EC", "#F9A8C9"],
  };

  const lineData = {
    labels: salesByDay.map((d) => d.label),
    datasets: [
      {
        label: "Revenue (₱)",
        data: salesByDay.map((d) => d.value),
        borderColor: chartColors.line,
        backgroundColor: chartColors.fill,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: "#ec4899",
      },
    ],
  };

  const top5 = [...inventory]
    .sort((a, b) => b.total_value - a.total_value)
    .slice(0, 5);

  const barData = {
    labels: top5.map((i) => i.name),
    datasets: [
      {
        label: "Total Value (₱)",
        data: top5.map((i) => i.total_value),
        backgroundColor: chartColors.bars,
        borderRadius: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: chartColors.text,
          font: {
            family: "'Baloo 2', DM Sans, sans-serif",
            weight: "bold" as const,
          },
        },
      },
      tooltip: {
        backgroundColor: "#831843",
        titleColor: "#fce7f3",
        bodyColor: "#fff",
        cornerRadius: 10,
        padding: 10,
      },
    },
    scales: {
      x: {
        ticks: { color: chartColors.text },
        grid: { color: chartColors.grid },
        border: { display: false },
      },
      y: {
        ticks: { color: chartColors.text },
        grid: { color: chartColors.grid },
        border: { display: false },
      },
    },
  };

  const fmt = (n: number) =>
    `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  const FLAVOR_DOT: Record<string, string> = {
    strawberry: "#F9A8C9",
    mint: "#B5E5D0",
    vanilla: "#FDDCAB",
    ube: "#AFA9EC",
  };

  return (
    <section className={styles.page} data-testid="dashboard-page">
      {/* ── Stats grid ── */}
      <div className={styles.statsGrid} data-testid="stats-grid">
        <StatsCard
          icon="fa-boxes-stacked"
          label="Total Products"
          value={stats.totalProducts}
          flavor="strawberry"
          delay={0.05}
          testId="stat-products"
        />
        <StatsCard
          icon="fa-peso-sign"
          label="Inventory Value"
          value={fmt(stats.totalInventoryValue)}
          flavor="mint"
          delay={0.12}
          testId="stat-inv-value"
        />
        <StatsCard
          icon="fa-chart-line"
          label="Sales Revenue"
          value={fmt(stats.totalSalesRevenue)}
          flavor="vanilla"
          delay={0.19}
          testId="stat-revenue"
        />
        <StatsCard
          icon="fa-truck"
          label="Pending Orders"
          value={stats.pendingOrders}
          flavor="ube"
          delay={0.26}
          testId="stat-pending-orders"
        />
        <StatsCard
          icon="fa-triangle-exclamation"
          label="Low Stock"
          value={stats.lowStockCount}
          flavor="cherry"
          delay={0.33}
          sub={`${stats.outOfStockCount} out of stock`}
          testId="stat-low-stock"
        />
      </div>

      {/* ── Charts row ── */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard} data-testid="revenue-chart">
          <h3 className={styles.chartTitle}>
            <i className="fa-solid fa-chart-line" /> Daily Sales Revenue
          </h3>
          <div className={styles.chartWrap}>
            {salesByDay.length > 0 ? (
              <Line data={lineData} options={chartOptions} />
            ) : (
              <p className={styles.noData}>No sales data yet.</p>
            )}
          </div>
        </div>

        <div className={styles.chartCard} data-testid="top-products-chart">
          <h3 className={styles.chartTitle}>
            <i className="fa-solid fa-ranking-star" /> Top Products by Value
          </h3>
          <div className={styles.chartWrap}>
            {top5.length > 0 ? (
              <Bar data={barData} options={chartOptions} />
            ) : (
              <p className={styles.noData}>No inventory data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Sales ── */}
      <div className={styles.recentCard} data-testid="recent-sales">
        <h3 className={styles.chartTitle}>
          <i className="fa-solid fa-receipt" /> Recent Sales
        </h3>
        <table className={styles.recentTable}>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.slice(0, 8).map((s) => (
              <tr key={s.id} data-testid={`recent-sale-${s.id}`}>
                <td>
                  <code>{s.transaction_id}</code>
                </td>
                <td>
                  <span
                    className={styles.flavorDot}
                    style={{
                      background:
                        FLAVOR_DOT[s.flavor ?? "strawberry"] ?? "#F9A8C9",
                    }}
                  />
                  {s.product_name}
                </td>
                <td>{s.quantity_sold}</td>
                <td style={{ fontWeight: 800 }}>{fmt(s.total_amount)}</td>
                <td>{new Date(s.sale_date).toLocaleDateString()}</td>
                <td>
                  <span
                    className={`${styles.pill} ${STATUS_PILL[s.status] ?? styles["pill--pending"]}`}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: 24, opacity: 0.5 }}
                >
                  No sales yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DashboardPage;
