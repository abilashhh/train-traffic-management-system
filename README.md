# Train Traffic Management System (TTMS)

**Author**: Abilash Karthi Balachandran Sangeetha  
**MSc in Advanced Computer Science**  
**Newcastle University**  

## Overview
This project is an interactive Train Traffic Management System designed to optimize the efficiency of station masters in managing train schedules, reducing human errors, and improving decision-making. The project leverages modern technologies like touch-screen interaction, drag-and-drop features, and real-time data synchronization.

## Project Goals
- Improve railway station operation efficiency.
- Develop an intuitive, user-friendly interface for station masters.
- Reduce human error in managing train schedules.
- Provide real-time data visualization and weather updates.
- Cross-device compatibility for both touchscreen and traditional monitors.

## Features
- **Drag-and-drop train scheduling**: Simplifies scheduling by letting station masters move trains with ease.
- **Real-time updates**: Automatically synchronizes schedules and statuses across devices.
- **Conflict detection**: Alerts users if scheduling conflicts arise, preventing platform collisions.
- **Weather data integration**: Helps plan schedules based on live weather data.
- **Multi-device compatibility**: Designed for both desktops and touchscreen devices.

## Technologies Used
- **Client-side Framework**: React.js (Progressive Web App).
- **Server-side Framework**: Firebase (Real-time database, serverless infrastructure).
- **Other Technologies**: OpenWeatherMap API for weather data, WebSockets for real-time communication.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (for running the front-end)
- [Firebase](https://firebase.google.com/) (for backend services)
- [OpenWeatherMap API Key](https://openweathermap.org/api) (for weather data integration)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/abilashhh/train-traffic-management-system.git
   cd train-traffic-management-system

2. **Install dependencies**:
   ```bash
   npm install

3. **Setup firebase**:
   - Create a Firebase project at Firebase Console.
   - Enable Firestore Database and Authentication services.
   - Copy the Firebase configuration details (API key, project ID, etc.).
   - Create a firebaseConfig.js file in your project folder and paste the Firebase config information:
     ```bash
        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_PROJECT_ID.appspot.com",
          messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
          appId: "YOUR_APP_ID"
          };
       export default firebaseConfig;

4. **Run the application:**:
   ```bash
   npm start

## Usage
**Once the application is running**:
- Log in as a station master using your email and password (or create an account if necessary).
- Manage train schedules using the drag-and-drop interface.
- View real-time updates on train statuses, weather conditions, and conflict detections.
- Switch stations and manage train traffic for multiple locations.

## Future Improvements
- Integrate machine learning models to predict train delays based on weather and historical data.

## Contact
**For further information or questions, feel free to reach out to me**:
- Abilash Karthi Balachandran Sangeetha
- Email: A.K.Balachandran-Sangeetha2@newcastle.ac.uk (or) abilashkarthi@outlook.com





