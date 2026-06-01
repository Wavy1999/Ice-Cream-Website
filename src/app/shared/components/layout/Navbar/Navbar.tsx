// ============================================================
//  Navbar  –  Top navigation bar (ice cream theme)
// ============================================================

import React from "react";
import { useAppStore } from "../../../../core/providers/AppStore";
import { authService } from "../../../../core/services/AuthService";
import { useToast } from "../../../hooks";
import styles from "./Navbar.module.css";

const PAGE_TITLES: Record<string, { label: string; icon: string }> = {
  dashboard: { label: "Dashboard", icon: "fa-gauge-high" },
  inventory: { label: "Inventory", icon: "fa-boxes-stacked" },
  sales: { label: "Sales", icon: "fa-receipt" },
  orders: { label: "Orders", icon: "fa-truck" },
  reports: { label: "Reports", icon: "fa-chart-bar" },
  settings: { label: "Settings", icon: "fa-gear" },
};

interface NavbarProps {
  activePage: string;
  onHamburger: () => void;
  lowStockCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onHamburger,
  lowStockCount = 0,
}) => {
  const { user, darkMode, toggleDark } = useAppStore((s) => ({
    user: s.user,
    darkMode: s.darkMode,
    toggleDark: s.toggleDark,
  }));
  const toast = useToast();

  async function handleLogout() {
    await authService.signOut();
    toast.info("Logged out.");
  }

  const page = PAGE_TITLES[activePage];

  return (
    <header className={styles.navbar} data-testid="navbar">
      {/* ── Left ── */}
      <div className={styles.left}>
        <button
          className={styles.hamburger}
          onClick={onHamburger}
          aria-label="Toggle navigation"
          data-testid="hamburger"
        >
          <i className="fa-solid fa-bars" aria-hidden />
        </button>

        <span className={styles.pageTitle} data-testid="page-title">
          {page ? (
            <>
              <i className={`fa-solid ${page.icon}`} aria-hidden />
              {page.label}
            </>
          ) : (
            activePage
          )}
        </span>
      </div>

      {/* ── Right ── */}
      <div className={styles.right}>
        {/* Low stock alert */}
        {lowStockCount > 0 && (
          <button
            className={styles.notifBtn}
            title={`${lowStockCount} items low/out of stock`}
            data-testid="notif-btn"
            aria-label={`${lowStockCount} stock alerts`}
          >
            <i className="fa-solid fa-bell" aria-hidden />
            <span className={styles.notifBadge}>{lowStockCount}</span>
          </button>
        )}

        {/* Theme toggle */}
        <button
          className={styles.themeBtn}
          onClick={toggleDark}
          aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
          data-testid="theme-toggle"
        >
          <i
            className={`fa-solid ${darkMode ? "fa-sun" : "fa-moon"}`}
            aria-hidden
          />
        </button>

        <span className={styles.divider} aria-hidden />

        {/* User + logout */}
        <div className={styles.userArea} data-testid="user-area">
          <span className={styles.userInitial} aria-hidden>
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </span>
          <span className={styles.userEmail}>{user?.email ?? "User"}</span>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Log out"
            data-testid="logout-btn"
            aria-label="Log out"
          >
            <i className="fa-solid fa-right-from-bracket" aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
