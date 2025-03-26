import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import '../Styles/NotificacaoRemoveProdutoAdm.css';

export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmação", 
  message = "Tem certeza que deseja realizar esta ação?" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal-container">
        <div className="confirmation-modal-header">
          <AlertTriangle className="confirmation-modal-icon" />
          <h2>{title}</h2>
        </div>
        
        <p className="confirmation-modal-message">{message}</p>
        
        <div className="confirmation-modal-actions">
          <button 
            onClick={onClose}
            className="confirmation-modal-btn confirmation-modal-cancel"
          >
            <X size={18} /> Cancelar
          </button>
          
          <button 
            onClick={onConfirm}
            className="confirmation-modal-btn confirmation-modal-confirm"
          >
            <Check size={18} /> Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};