// ============================================================
//  Sidebar  –  Navigation layout component (ice cream theme)
// ============================================================

import React from "react";
import { useAppStore } from "../../../../core/providers/AppStore";
import styles from "./Sidebar.module.css";

export interface NavItem {
  page: string;
  icon: string;
  label: string;
  flavor: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    page: "dashboard",
    icon: "fa-gauge-high",
    label: "Dashboard",
    flavor: "strawberry",
  },
  {
    page: "inventory",
    icon: "fa-boxes-stacked",
    label: "Inventory",
    flavor: "mint",
  },
  { page: "sales", icon: "fa-receipt", label: "Sales", flavor: "vanilla" },
  { page: "orders", icon: "fa-truck", label: "Orders", flavor: "ube" },
  { page: "reports", icon: "fa-chart-bar", label: "Reports", flavor: "cherry" },
  { page: "settings", icon: "fa-gear", label: "Settings", flavor: "blueberry" },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  open,
  onClose,
}) => {
  const { settings } = useAppStore((s) => ({ settings: s.settings }));
  const appName = settings?.app_name ?? "Chriselle Ice Cream";
  const subtitle = "Inventory Management System";

  return (
    <>
      {open && (
        <div
          className={styles.overlay}
          onClick={onClose}
          data-testid="sidebar-overlay"
          aria-hidden
        />
      )}

      <aside
        className={`${styles.sidebar} ${open ? styles.open : ""}`}
        data-testid="sidebar"
        aria-label="Main navigation"
      >
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            <span className={styles.logoIcon}>🍦</span>
            <div className={styles.logoDrip} />
          </div>
          <div className={styles.brandText}>
            <div className={styles.title}>{appName}</div>
            <div className={styles.subtitle}>{subtitle}</div>
          </div>
        </div>

        {/* ── Sprinkle divider ── */}
        <div className={styles.sprinkleDivider}>
          {[
            "#F9A8C9",
            "#B5E5D0",
            "#FDDCAB",
            "#AFA9EC",
            "#F9A8C9",
            "#B5E5D0",
            "#FDDCAB",
            "#AFA9EC",
          ].map((c, i) => (
            <span
              key={i}
              className={styles.sprinkle}
              style={{ background: c, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* ── Nav ── */}
        <nav className={styles.nav} aria-label="Pages">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.page}
              className={`${styles.navItem} ${styles[`flavor--${item.flavor}`]} ${activePage === item.page ? styles.active : ""}`}
              style={{ animationDelay: `${0.05 + i * 0.06}s` }}
              onClick={() => {
                onNavigate(item.page);
                onClose();
              }}
              data-testid={`nav-${item.page}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onNavigate(item.page)}
              aria-current={activePage === item.page ? "page" : undefined}
            >
              <span className={styles.navIconWrap}>
                <i className={`fa-solid ${item.icon}`} aria-hidden />
              </span>
              <span className={styles.navLabel}>{item.label}</span>
              {activePage === item.page && (
                <span className={styles.activeBlob} aria-hidden />
              )}
            </a>
          ))}
        </nav>

        {/* ── Footer ── */}
        <footer className={styles.footer}>
          <div className={styles.footerScoop} aria-hidden>
            🍒
          </div>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} Chriselle Ice Cream.
            <br />
            <span className={styles.footerPowered}>Powered by Wave</span>
          </p>
        </footer>
      </aside>
    </>
  );
};

export default Sidebar;
