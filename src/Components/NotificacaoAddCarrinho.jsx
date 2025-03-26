import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import '../Styles/NotificacaoAddCarrinho.css';

export const Notification = ({ 
  message, 
  type = 'success', 
  duration = 3000 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const iconMap = {
    success: <CheckCircle className="icon success-icon" />,
    error: <XCircle className="icon error-icon" />,
    warning: <AlertCircle className="icon warning-icon" />
  };

  return (
    <div className={`notification ${type}`}>
      {iconMap[type]}
      <div className="notification-content">
        <p>{message}</p>
      </div>
      <button 
        onClick={() => setVisible(false)} 
        className="close-button"
      >
        <XCircle size={20} />
      </button>
    </div>
  );
};

// Custom hook para gerenciar notificações
export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const NotificationComponent = notification ? (
    <Notification 
      message={notification.message} 
      type={notification.type} 
    />
  ) : null;

  return { showNotification, NotificationComponent };
};