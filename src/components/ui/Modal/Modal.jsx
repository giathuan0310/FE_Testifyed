import React from 'react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  onConfirm,
  confirmText = 'Xác nhận',
  onCancel,
  cancelText = 'Hủy',
  loading = false,
  footer
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const sizeClasses = {
    small: 'modal-small',
    medium: 'modal-medium',
    large: 'modal-large',
    xlarge: 'modal-xlarge'
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={`modal-container ${sizeClasses[size]}`}>
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          {showCloseButton && (
            <button
              type="button"
              className="modal-close-button"
              onClick={onClose}
              aria-label="Đóng"
            >
              ×
            </button>
          )}
        </div>

        {/* Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {footer ? (
            footer
          ) : (
            <>
              {onCancel && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelText}
                </button>
              )}
              {onConfirm && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : confirmText}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;