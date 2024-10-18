// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

// Initialize Firestore
const db = getFirestore(app);

const auth = getAuth(app);

export { db, auth, app };
