//LogoutConfirmationModal.js
import React from 'react';
import './LogoutConfirmationModal.css';

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Logging out</h2>
        <p>Are you sure you want to log out?</p>
        <div className="modal-buttons">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="confirm-button" onClick={onConfirm}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;