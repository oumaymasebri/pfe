// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBF8F8h7DsKqZwi8YdhNnc2Xds4vP5Cm5I",
  authDomain: "smartappbus.firebaseapp.com",
  projectId: "smartappbus",
  storageBucket: "smartappbus.firebasestorage.app",
  messagingSenderId: "1066562552936",
  appId: "1:1066562552936:web:56b0e217ea8256411aa7dd",
  measurementId: "G-2ZFTEVQTB7",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
