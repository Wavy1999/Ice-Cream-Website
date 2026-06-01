// ============================================================
//  ToastContainer  –  Renders all active toasts (ice cream theme)
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom';
import { useAppStore } from '../../../../core/providers/AppStore';
import styles from './Toast.module.css';

const ICONS: Record<string, string> = {
  success: 'fa-circle-check',
  error:   'fa-circle-xmark',
  warning: 'fa-triangle-exclamation',
  info:    'fa-circle-info',
};

// Flavor emoji suffix per type — matches the ice cream palette
const FLAVOR: Record<string, string> = {
  success: '🌿',
  error:   '🍒',
  warning: '🍦',
  info:    '🫐',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore(s => ({
    toasts:      s.toasts,
    removeToast: s.removeToast,
  }));

  if (!toasts.length) return null;

  return ReactDOM.createPortal(
    <div
      className={styles.container}
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.type]}`}
          data-testid={`toast-${t.type}`}
          onClick={() => removeToast(t.id)}
          role="alert"
          aria-atomic="true"
        >
          <i
            className={`fa-solid ${ICONS[t.type]} ${styles.icon}`}
            aria-hidden
          />
          <span className={styles.message}>{t.message}</span>
          <button
            className={styles.dismiss}
            onClick={e => { e.stopPropagation(); removeToast(t.id); }}
            aria-label={`Dismiss ${t.type} notification`}
          >
            <i className="fa-solid fa-xmark" aria-hidden />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;