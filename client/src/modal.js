import React from 'react';
import './Modal.css';

const Modal = ({ show, onClose, message, data }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        {message ? (
          <p>{message}</p>
        ) : (
          data && (
            <div>
              <h2>Train Details</h2>
              <p><strong>Train ID:</strong> {data.trainId}</p>
              <p><strong>Arrival Time:</strong> {new Date(data.arrivalTime).toLocaleString()}</p>
              <p><strong>Departure Time:</strong> {new Date(data.departureTime).toLocaleString()}</p>
              <p><strong>Updated Departure Time:</strong> {new Date(data.updatedDepartureTime).toLocaleString()}</p>
              <p><strong>Platform:</strong> {data.platform}</p>
              <p><strong>Status:</strong> {data.status}</p>
            </div>
          )
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
