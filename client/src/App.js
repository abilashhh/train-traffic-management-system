import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, getDoc, doc, updateDoc, query, where, setDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import Timeline, { TimelineMarkers, TodayMarker } from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
import Modal from './modal';
import SideOutPanel from './sideOutPanel';
import StationSelection from './StationSelection';
import Auth from './Auth';
import { db } from './firebase';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import './App.css';
import WeatherWidget from './WeatherWidget';

function App() {
  const [isStationSelected, setIsStationSelected] = useState(false);
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Trains');
  const [showModal, setShowModal] = useState(false);
  const [showLogPanel, setShowLogPanel] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalData, setModalData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchStationsAndPlatforms = async () => {
      try {
        const totalPlatformsDoc = await getDoc(doc(db, 'stations', 'TotalPlatforms'));
        const stationPlatforms = totalPlatformsDoc.data();
        setStations(Object.keys(stationPlatforms));
        console.log('Fetched Stations:', Object.keys(stationPlatforms));
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };
    fetchStationsAndPlatforms();

    // Update current time every second
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const filterTrains = useCallback((trainData = trains, status = selectedStatus) => {
    if (status === 'All Trains') {
      setFilteredTrains(trainData);
    } else {
      const filtered = trainData.filter(train => train.status.toLowerCase() === status.toLowerCase());
      setFilteredTrains(filtered);
    }
  }, [trains, selectedStatus]);

  useEffect(() => {
    filterTrains();
  }, [filterTrains]);

  const fetchTrainsForStation = async (station) => {
    try {
      const q = query(collection(db, "train"), where("station", "==", station));
      const querySnapshot = await getDocs(q);
      const trainsData = querySnapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
      console.log('Fetched Trains for Station:', trainsData);
      
      // Fetch platform count for the selected station
      const totalPlatformsDoc = await getDoc(doc(db, 'stations', 'TotalPlatforms'));
      const stationPlatforms = totalPlatformsDoc.data();
      const platformCount = parseInt(stationPlatforms[station]);
      
      // Generate platforms array
      const platformsArray = Array.from({ length: platformCount }, (_, i) => ({
        id: `Platform ${i + 1}`,
        title: `Platform ${i + 1}`
      }));
      
      // Update state in a single batch to trigger only one re-render
      setTrains(trainsData);
      setPlatforms(platformsArray);
      filterTrains(trainsData, selectedStatus);
    } catch (error) {
      console.error('Error fetching trains for station:', error);
    }
  };

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    setIsStationSelected(true);
    fetchTrainsForStation(station);
    fetchLogsForStation(station);
  };

  const addLogToFirebase = async (station, message) => {
    const logRef = doc(db, 'change-logs', station);
    const today = new Date().toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
    const currentTime = new Date().toLocaleTimeString(); // Get current time as string

    try {
      await setDoc(logRef, {
        [today]: {
          [currentTime]: message
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error adding log to Firebase:', error);
    }
  };

  const fetchLogsForStation = async (station) => {
    const logRef = doc(db, 'change-logs', station);
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    try {
      const docSnap = await getDoc(logRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const todaysLogs = data[today] || {};
        const formattedLogs = Object.entries(todaysLogs).map(([time, message]) => ({
          time,
          message
        }));
        setLogs(formattedLogs);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    }
  };

  const handleStationChange = (event) => {
    const newStation = event.target.value;
    setSelectedStation(newStation);
    if (newStation) {
      fetchTrainsForStation(newStation);
      fetchLogsForStation(newStation);
    } else {
      setTrains([]);
      setFilteredTrains([]);
      setPlatforms([]);
      setLogs([]);
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    filterTrains(trains, status);
  };

  const handleItemMove = async (itemId, dragTime, newGroupOrder) => {
    const updatedTrain = trains.find(train => train._id === itemId);
    const duration = new Date(updatedTrain.updatedDepartureTime) - new Date(updatedTrain.arrivalTime);
    const newStartTime = new Date(dragTime).toISOString();
    const newEndTime = new Date(dragTime + duration).toISOString();
    const newPlatform = platforms[newGroupOrder].id;

    // Check for collisions with all trains, not just filtered ones
    const collidingTrain = trains.find(train =>
      train._id !== itemId &&
      train.platform === newPlatform &&
      (
        (new Date(newStartTime) >= new Date(train.arrivalTime) && new Date(newStartTime) <= new Date(train.updatedDepartureTime)) ||
        (new Date(newEndTime) >= new Date(train.arrivalTime) && new Date(newEndTime) <= new Date(train.updatedDepartureTime))
      )
    );

    if (collidingTrain) {
      setModalMessage(`Conflict detected with train ${collidingTrain.trainId}.`);
      setShowModal(true);
      return; // Prevent the move
    }

    const logMessage = `Moved train ${updatedTrain.trainId} from ${updatedTrain.platform} (${new Date(updatedTrain.arrivalTime).toLocaleTimeString()} - ${new Date(updatedTrain.updatedDepartureTime).toLocaleTimeString()}) to ${newPlatform} (${new Date(newStartTime).toLocaleTimeString()} - ${new Date(newEndTime).toLocaleTimeString()}).`;
    await addLogToFirebase(selectedStation, logMessage);
    fetchLogsForStation(selectedStation);

    updatedTrain.arrivalTime = newStartTime;
    updatedTrain.updatedDepartureTime = newEndTime;
    updatedTrain.platform = newPlatform;

    const trainDoc = doc(db, "train", itemId);
    await updateDoc(trainDoc, {
      arrivalTime: updatedTrain.arrivalTime,
      updatedDepartureTime: updatedTrain.updatedDepartureTime,
      platform: updatedTrain.platform,
    });
    setTrains(prevTrains => {
      const newTrains = prevTrains.map(train => (train._id === itemId ? updatedTrain : train));
      filterTrains(newTrains);
      return newTrains;
    });
    updateStatus(itemId);
  };

  const handleItemResize = async (itemId, time, edge) => {
    const updatedTrain = trains.find(train => train._id === itemId);
    const newTime = new Date(time).toISOString();

    const newStartTime = edge === 'left' ? newTime : updatedTrain.arrivalTime;
    const newEndTime = edge === 'left' ? updatedTrain.updatedDepartureTime : newTime;

    // Check for collisions with all trains, not just filtered ones
    const collidingTrain = trains.find(train =>
      train._id !== itemId &&
      train.platform === updatedTrain.platform &&
      (
        (new Date(newStartTime) >= new Date(train.arrivalTime) && new Date(newStartTime) <= new Date(train.updatedDepartureTime)) ||
        (new Date(newEndTime) >= new Date(train.arrivalTime) && new Date(newEndTime) <= new Date(train.updatedDepartureTime))
      )
    );

    if (collidingTrain) {
      setModalMessage(`Collision detected with train ${collidingTrain.trainId}.`);
      setShowModal(true);
      return; // Prevent the resize
    }

    const message = edge === 'left'
      ? `Changed arrival time of train ${updatedTrain.trainId} from ${new Date(updatedTrain.arrivalTime).toLocaleTimeString()} to ${new Date(newTime).toLocaleTimeString()}.`
      : `Changed departure time of train ${updatedTrain.trainId} from ${new Date(updatedTrain.updatedDepartureTime).toLocaleTimeString()} to ${new Date(newTime).toLocaleTimeString()}.`;

    await addLogToFirebase(selectedStation, message);
    fetchLogsForStation(selectedStation);

    if (edge === 'left') {
      updatedTrain.arrivalTime = newTime;
    } else {
      updatedTrain.updatedDepartureTime = newTime;
    }

    const trainDoc = doc(db, "train", itemId);
    await updateDoc(trainDoc, {
      arrivalTime: updatedTrain.arrivalTime,
      updatedDepartureTime: updatedTrain.updatedDepartureTime,
    });
    setTrains(prevTrains => {
      const newTrains = prevTrains.map(train => (train._id === itemId ? updatedTrain : train));
      filterTrains(newTrains);
      return newTrains;
    });
    updateStatus(itemId);
  };

  const updateStatus = async (itemId) => {
    const updatedTrain = trains.find(train => train._id === itemId);
    const { updatedDepartureTime, departureTime, status: currentStatus } = updatedTrain;
  
    let newStatus = 'on-time';
    if (new Date(updatedDepartureTime) > new Date(departureTime)) {
      newStatus = 'delayed';
    }
  
    if (newStatus !== currentStatus) {
      const trainDoc = doc(db, "train", itemId);
      await updateDoc(trainDoc, { status: newStatus });
  
      setTrains(prevTrains => {
        const newTrains = prevTrains.map(train => (train._id === itemId ? { ...updatedTrain, status: newStatus } : train));
        filterTrains(newTrains);
        return newTrains;
      });
  
      const logMessage = `Updated status of train ${updatedTrain.trainId} from ${currentStatus} to ${newStatus}.`;
      await addLogToFirebase(selectedStation, logMessage);
      fetchLogsForStation(selectedStation);
    } else {
      // If status didn't change, just update the trains state to trigger re-render
      setTrains(prevTrains => {
        const newTrains = prevTrains.map(train => (train._id === itemId ? updatedTrain : train));
        filterTrains(newTrains);
        return newTrains;
      });
    }
  };

  const handleItemDoubleClick = async (itemId) => {
    const trainDoc = doc(db, "train", itemId);
    const trainSnapshot = await getDoc(trainDoc);
    if (trainSnapshot.exists()) {
      setSelectedTrain({ ...trainSnapshot.data(), _id: itemId });
    } else {
      setModalMessage('Train details not found.');
      setShowModal(true);
    }
  };

  const handleTrainStatusChange = async (trainId, newStatus) => {
    const trainDoc = doc(db, "train", trainId);
    await updateDoc(trainDoc, { status: newStatus });

    setTrains(prevTrains => {
      const newTrains = prevTrains.map(train => (train._id === trainId ? { ...train, status: newStatus } : train));
      filterTrains(newTrains);
      return newTrains;
    });

    const logMessage = `Changed status of train ${trainId} to ${newStatus}.`;
    await addLogToFirebase(selectedStation, logMessage);
    fetchLogsForStation(selectedStation);

    // Update the selected train state to reflect the new status in the side-out panel
    setSelectedTrain(prevTrain => (prevTrain ? { ...prevTrain, status: newStatus } : null));
  };

  const getItemClassName = (train) => {
    if (train.status === 'cancelled') {
      return 'cancelled';
    }
    return train.status.toLowerCase() === 'on-time' ? 'on-time' : 'delayed';
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
    setModalData(null);
  };

  const closeLogPanel = () => {
    setShowLogPanel(false);
  };

  const closeTrainPanel = () => {
    setSelectedTrain(null);
  };

  const handleLogin = (user) => {
    setUser(user);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleLogoutConfirm = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null);
      setIsStationSelected(false);
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="App">
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : !isStationSelected ? (
        <StationSelection onStationSelect={handleStationSelect} />
      ) : (
        <>
          <header className="header">
            <div className="header-left">
              Train Traffic Management System
            </div>
            <div className="header-right">
              <WeatherWidget station={selectedStation} />
              <div className="live-time">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <button className="logout-button" onClick={handleLogoutClick}>Logout</button>
            </div>
          </header>
          <div className="button-container">
            <select 
              value={selectedStation} 
              onChange={handleStationChange}
              className="station-dropdown"
            >
              <option value="">Select Station</option>
              {stations.map((station, index) => (
                <option key={index} value={station}>{station}</option>
              ))}
            </select>
            <div className="filter-buttons">
              {['All Trains', 'On-time', 'Delayed', 'Cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`filter-button ${selectedStatus === status ? 'active' : ''}`}
                >
                  {status}
                </button>
              ))}
            </div>
            <button className="log-button" onClick={() => setShowLogPanel(true)}>Show Logs</button>
          </div>
          {selectedStation && platforms.length > 0 && (
            <div className="timeline-container">
              <Timeline
                groups={platforms}
                items={filteredTrains.map(train => ({
                  id: train._id,
                  group: train.platform,
                  title: train.trainId,
                  start_time: new Date(train.arrivalTime),
                  end_time: new Date(train.updatedDepartureTime),
                  className: getItemClassName(train),
                }))}
                defaultTimeStart={new Date()}
                defaultTimeEnd={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                onItemMove={handleItemMove}
                onItemResize={handleItemResize}
                onItemDoubleClick={handleItemDoubleClick}
                canResize="both"
                dragSnap={1000 * 60}
              >
                <TimelineMarkers>
                  <TodayMarker interval={1000} />
                </TimelineMarkers>
              </Timeline>
            </div>
          )}
          <Modal show={showModal} onClose={closeModal} message={modalMessage} data={modalData} />
          <SideOutPanel
            show={showLogPanel}
            onClose={closeLogPanel}
            logs={logs}
          />
          {selectedTrain && (
            <SideOutPanel
              show={true}
              onClose={closeTrainPanel}
              trainDetails={selectedTrain}
              onChangeTrainStatus={handleTrainStatusChange}
            />
          )}
          <LogoutConfirmationModal 
            isOpen={showLogoutModal}
            onClose={handleLogoutCancel}
            onConfirm={handleLogoutConfirm}
          />
        </>
      )}
    </div>
  );
}

export default App;