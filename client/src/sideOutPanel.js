import React from 'react';
import './SideOutPanel.css';

const SideOutPanel = ({ show, onClose, logs, trainDetails, onChangeTrainStatus }) => {
  const handleStatusChange = () => {
    if (trainDetails.status === 'cancelled') {
      // Determine the new status based on times
      const {departureTime, updatedDepartureTime } = trainDetails;
      let newStatus = 'on-time';
      if (new Date(updatedDepartureTime) > new Date(departureTime)) {
        newStatus = 'delayed';
      }
      onChangeTrainStatus(trainDetails._id, newStatus);
    } else {
      onChangeTrainStatus(trainDetails._id, 'cancelled');
    }
  };

  return (
    <div className={`side-out-panel ${show ? 'show' : ''}`}>
      <div className="side-out-panel-header">
        {logs ? <h2>Change Log</h2> : <h2>Train Details</h2>}
        <button className="close-button" onClick={onClose}>X</button>
      </div>
      <div className="side-out-panel-content">
        {logs && logs.map((log, index) => (
          <div key={index} className="log-entry">
            <p>{log.time}: {log.message}</p>
          </div>
        ))}
        {trainDetails && (
          <div>
            <p><strong>Train ID:</strong> {trainDetails.trainId}</p>
            <p><strong>operator:</strong> {trainDetails.operator}</p>
            <p><strong>Arrival Time:</strong> {new Date(trainDetails.arrivalTime).toLocaleString()}</p>
            <p><strong>Departure Time:</strong> {new Date(trainDetails.departureTime).toLocaleString()}</p>
            <p><strong>Updated Departure Time:</strong> {new Date(trainDetails.updatedDepartureTime).toLocaleString()}</p>
            <p><strong>Platform:</strong> {trainDetails.platform}</p>
            <p><strong>Status:</strong> {trainDetails.status}</p>
            <button className={`status-button ${trainDetails.status === 'cancelled' ? 'available' : 'cancel'}`} onClick={handleStatusChange}>
              {trainDetails.status === 'cancelled' ? 'Available' : 'Cancel Train'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideOutPanel;
