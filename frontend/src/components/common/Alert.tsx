import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ 
  type, 
  message, 
  onClose, 
  className = '' 
}) => {
  return (
    <div className={`alert alert-${type} ${className}`}>
      <span>{message}</span>
      {onClose && (
        <button 
          onClick={onClose} 
          className="btn btn-sm btn-outline"
          style={{ marginLeft: 'auto' }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;