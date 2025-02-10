// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, runTransaction } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD_bA1gwEPSfbZl6TTb0qyRPQzI5QMZEuA",
    authDomain: "riichimahjongtrainer-e2ce3.firebaseapp.com",
    databaseURL: "https://riichimahjongtrainer-e2ce3-default-rtdb.firebaseio.com",
    projectId: "riichimahjongtrainer-e2ce3",
    storageBucket: "riichimahjongtrainer-e2ce3.firebasestorage.app",
    messagingSenderId: "1000189798455",
    appId: "1:1000189798455:web:2b25721f5a51b10efe77b2",
    measurementId: "G-8WMJ7R46PB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const userCountsRef = ref(db, "userCounts");

const analytics = getAnalytics(app);

export { db, runTransaction, userCountsRef };
