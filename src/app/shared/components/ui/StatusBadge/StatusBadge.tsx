// ============================================================
//  StatusBadge  –  Inventory/Order status pill (ice cream theme)
// ============================================================

import React from 'react';
import type { StockStatus, OrderStatus } from '../../../types';
import styles from './StatusBadge.module.css';

type AnyStatus = StockStatus | OrderStatus;

const CONFIG: Record<AnyStatus, { label: string; cls: string; aria: string }> = {
  'in-stock':     { label: 'In Stock',     cls: 'inStock',    aria: 'Status: In Stock'     },
  'low-stock':    { label: 'Low Stock',    cls: 'lowStock',   aria: 'Status: Low Stock'    },
  'out-of-stock': { label: 'Out of Stock', cls: 'outOfStock', aria: 'Status: Out of Stock' },
  'pending':      { label: 'Pending',      cls: 'pending',    aria: 'Status: Pending'      },
  'fulfilled':    { label: 'Fulfilled',    cls: 'fulfilled',  aria: 'Status: Fulfilled'    },
  'cancelled':    { label: 'Cancelled',    cls: 'cancelled',  aria: 'Status: Cancelled'    },
};

interface StatusBadgeProps {
  status:     AnyStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const cfg = CONFIG[status] ?? { label: status, cls: 'inStock', aria: `Status: ${status}` };
  return (
    <span
      className={`${styles.badge} ${styles[cfg.cls]} ${className}`.trim()}
      data-testid={`status-badge-${status}`}
      aria-label={cfg.aria}
      role="status"
    >
      {cfg.label}
    </span>
  );
};

export default StatusBadge;