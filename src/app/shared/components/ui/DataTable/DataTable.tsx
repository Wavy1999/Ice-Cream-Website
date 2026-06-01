// ============================================================
//  DataTable  –  Generic sortable, paginated table (ice cream theme)
// ============================================================

import React from "react";
import type { PaginationState } from "../../../types";
import styles from "./DataTable.module.css";

export interface Column<T> {
  key:       keyof T | string;
  header:    string;
  sortable?: boolean;
  width?:    string;
  render?:   (row: T) => React.ReactNode;
  testId?:   string;
}

interface DataTableProps<T> {
  columns:       Column<T>[];
  data:          T[];
  rowKey:        (row: T) => string;
  pagination?:   PaginationState;
  totalPages?:   number;
  onPageChange?: (page: number) => void;
  sortColumn?:   string | null;
  sortDir?:      "asc" | "desc";
  onSort?:       (col: string) => void;
  selectable?:   boolean;
  selected?:     Set<string>;
  onToggleRow?:  (id: string) => void;
  onToggleAll?:  (ids: string[], checked: boolean) => void;
  loading?:      boolean;
  emptyMessage?: string;
  className?:    string;
  testId?:       string;
}

// ── Loading skeleton rows ────────────────────────────────────
const SkeletonRows: React.FC<{ cols: number }> = ({ cols }) => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className={styles.skeletonRow} style={{ animationDelay: `${i * 0.07}s` }}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j}>
            <span className={styles.skeletonCell} style={{ width: `${55 + (j * 17) % 35}%` }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export function DataTable<T>({
  columns,
  data,
  rowKey,
  pagination,
  totalPages = 1,
  onPageChange,
  sortColumn,
  sortDir,
  onSort,
  selectable,
  selected,
  onToggleRow,
  onToggleAll,
  loading,
  emptyMessage = "No data found.",
  className = "",
  testId,
}: DataTableProps<T>) {
  const allIds     = data.map(rowKey);
  const allChecked = selectable && allIds.length > 0 && allIds.every(id => selected?.has(id));
  const colSpan    = columns.length + (selectable ? 1 : 0);

  return (
    <div className={`${styles.wrapper} ${className}`} data-testid={testId}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>

          {/* ── Head ── */}
          <thead>
            <tr>
              {selectable && (
                <th className={styles.checkCell}>
                  <input
                    type="checkbox"
                    checked={!!allChecked}
                    onChange={e => onToggleAll?.(allIds, e.target.checked)}
                    data-testid="select-all"
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  style={{ width: col.width }}
                  className={col.sortable ? styles.sortable : ""}
                  onClick={col.sortable ? () => onSort?.(String(col.key)) : undefined}
                  data-testid={`th-${String(col.key)}`}
                  aria-sort={
                    sortColumn === String(col.key)
                      ? sortDir === "asc" ? "ascending" : "descending"
                      : undefined
                  }
                >
                  {col.header}
                  {col.sortable && (
                    <span className={styles.sortIcon} aria-hidden>
                      {sortColumn === String(col.key)
                        ? sortDir === "asc" ? " ↑" : " ↓"
                        : " ↕"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody data-testid="table-body">
            {loading ? (
              <SkeletonRows cols={colSpan} />
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className={styles.empty}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const id = rowKey(row);
                return (
                  <tr
                    key={id}
                    className={selected?.has(id) ? styles.selectedRow : ""}
                    style={{ animationDelay: `${Math.min(rowIndex, 9) * 0.03}s` }}
                    data-testid={`row-${id}`}
                  >
                    {selectable && (
                      <td className={styles.checkCell}>
                        <input
                          type="checkbox"
                          checked={selected?.has(id) ?? false}
                          onChange={() => onToggleRow?.(id)}
                          data-testid={`check-${id}`}
                          aria-label={`Select row ${id}`}
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td
                        key={String(col.key)}
                        data-testid={col.testId ? `${col.testId}-${id}` : undefined}
                      >
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pagination && totalPages > 1 && (
        <div className={styles.pagination} data-testid="pagination">
          <span className={styles.pageInfo}>
            Page {pagination.page} / {totalPages}
            &nbsp;· {pagination.total} total
          </span>
          <div className={styles.pageButtons}>
            <button
              onClick={() => onPageChange?.(1)}
              disabled={pagination.page === 1}
              aria-label="First page"
              data-testid="pg-first"
            >«</button>
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="Previous page"
              data-testid="pg-prev"
            >‹</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - pagination.page) <= 2)
              .map(p => (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  className={p === pagination.page ? styles.activePage : ""}
                  aria-label={`Page ${p}`}
                  aria-current={p === pagination.page ? "page" : undefined}
                  data-testid={`pg-${p}`}
                >{p}</button>
              ))}

            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              aria-label="Next page"
              data-testid="pg-next"
            >›</button>
            <button
              onClick={() => onPageChange?.(totalPages)}
              disabled={pagination.page === totalPages}
              aria-label="Last page"
              data-testid="pg-last"
            >»</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;