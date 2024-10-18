import React, { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import './StationSelection.css';

function StationSelection({ onStationSelect }) {
  const [step, setStep] = useState(1);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const totalPlatformsDoc = await getDoc(doc(db, 'stations', 'TotalPlatforms'));
        const stationPlatforms = totalPlatformsDoc.data();
        setStations(Object.keys(stationPlatforms));
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };
    fetchStations();
  }, []);

  const handleNext = () => setStep(2);

  const handleStationSelect = (station) => {
    onStationSelect(station);
  };

  return (
    <div className="station-selection">
      {step === 1 ? (
        <div className="welcome-screen">
          <h1>Welcome to the Platform Management App</h1>
          <button onClick={handleNext} className="next-button">Next</button>
        </div>
      ) : (
        <div className="station-select-screen">
          <h2>Please select a station</h2>
          <div className="station-grid">
            {stations.map((station, index) => (
              <button
                key={index}
                onClick={() => handleStationSelect(station)}
                className="station-button"
              >
                {station}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StationSelection;