import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import '../Styles/NotificacaoAddCarrinho.css';

export const Notification = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`notification notification-${type}`}>
      {type === 'success' && <Check className="notification-icon" />}
      {type === 'error' && <X className="notification-icon" />}
      <span className="notification-message">{message}</span>
    </div>
  );
};

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const newNotification = { id, message, type, duration };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const NotificationContainer = () => (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification 
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );

  return { 
    addNotification, 
    removeNotification, 
    NotificationContainer 
  };
};