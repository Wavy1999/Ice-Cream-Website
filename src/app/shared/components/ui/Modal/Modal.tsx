// ============================================================
//  Modal  –  Portal-based overlay (ice cream theme)
// ============================================================

import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  open:      boolean;
  onClose:   () => void;
  title?:    string;
  size?:     ModalSize;
  children:  React.ReactNode;
  footer?:   React.ReactNode;
  maxWidth?: string;  
  /** Prevent closing on backdrop click or Escape */
  static?:   boolean;
  testId?:   string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  static: isStatic = false,
  testId,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isStatic) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, isStatic]);

  // Focus trap — move focus into modal on open
  useEffect(() => {
    if (open) {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [open]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className={styles.overlay}
      onClick={isStatic ? undefined : onClose}
      data-testid={testId ?? 'modal-overlay'}
      role="dialog"
      aria-modal
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={`${styles.modal} ${styles[size]}`}
        onClick={e => e.stopPropagation()}
        data-testid="modal"
      >
        {/* ── Header ── */}
        {title && (
          <>
            <div className={styles.header}>
              <h3 className={styles.title} id="modal-title">{title}</h3>
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close modal"
                data-testid="modal-close"
              >
                <i className="fa-solid fa-xmark" aria-hidden />
              </button>
            </div>
            <div className={styles.divider} />
          </>
        )}

        {/* ── Body ── */}
        <div className={styles.body}>{children}</div>

        {/* ── Footer ── */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;