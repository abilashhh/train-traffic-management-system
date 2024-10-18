const { initializeApp } = require('firebase/app');
const { getFirestore, setDoc, doc, getDoc } = require('firebase/firestore');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEAr3PpVZS3pZFgbHMW1noEkhbJwo39Iw",
  authDomain: "test-project-ec1c2.firebaseapp.com",
  projectId: "test-project-ec1c2",
  storageBucket: "test-project-ec1c2.appspot.com",
  messagingSenderId: "726339624415",
  appId: "1:726339624415:web:72c33d1c85b8198e13f86a",
  measurementId: "G-YR1ZL65D69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample train operators
const operators = ['LNER', 'CrossCountry', 'TransPennine Express', 'Northern Rail', 'ScotRail'];

// Generate a random time between two times
function randomTime(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate a random train ID
function generateTrainId(operator) {
  const letters = operator.split(' ').map(word => word[0]).join('');
  const numbers = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${letters}${numbers}`;
}

// Generate sample train data
async function generateTrainData() {
  const startDate = new Date('2024-08-22');
  const endDate = new Date('2024-08-23');

  console.log('Starting data generation...');

  // Fetch the TotalPlatforms document
  const totalPlatformsDoc = await getDoc(doc(db, 'stations', 'TotalPlatforms'));
  const stationPlatforms = totalPlatformsDoc.data();

  // Define the stations you want to add trains to
  const targetStations = {
    "Durham Station": stationPlatforms["Durham Station"],
    
  };

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    console.log(`Generating data for date: ${date.toDateString()}`);
    for (const [station, platformCount] of Object.entries(targetStations)) {
      console.log(`  Generating trains for station: ${station} with ${platformCount} platforms`);
      for (let i = 0; i < 20; i++) {
        const operator = operators[Math.floor(Math.random() * operators.length)];
        const trainId = generateTrainId(operator);
        const platform = `Platform ${Math.floor(Math.random() * parseInt(platformCount)) + 1}`;
        
        const arrivalTime = randomTime(
          new Date(date.setHours(0, 0, 0, 0)),
          new Date(date.setHours(23, 0, 0, 0))
        );
        
        const departureTime = new Date(arrivalTime.getTime() + (5 * 60 * 1000)); // 5 minutes after arrival
        const updatedDepartureTime = new Date(departureTime);
        
        const status = Math.random() < 0.8 ? 'on-time' : (Math.random() < 0.5 ? 'delayed' : 'cancelled');
        
        if (status === 'delayed') {
          updatedDepartureTime.setMinutes(updatedDepartureTime.getMinutes() + Math.floor(Math.random() * 30) + 1);
        }

        const trainData = {
          trainId,
          station,
          platform,
          arrivalTime: arrivalTime.toISOString(),
          departureTime: departureTime.toISOString(),
          updatedDepartureTime: updatedDepartureTime.toISOString(),
          status,
          operator
        };

        console.log(`    Attempting to add train ${trainId} to database...`);
        try {
          await setDoc(doc(db, 'train', trainId), trainData);
          console.log(`    Successfully added train ${trainId} to ${station} on ${date.toDateString()}`);
        } catch (error) {
          console.error(`    Error adding train ${trainId}: `, error);
        }
      }
    }
  }
  console.log('Data generation complete');
}

generateTrainData().then(() => console.log('Script execution finished')).catch(error => console.error('Script execution failed:', error));
