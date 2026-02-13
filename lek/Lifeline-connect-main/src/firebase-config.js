// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWF0JTwva4F3eaa-AhW8mjzz41DRY0UVM",
    authDomain: "lifeline-connect-1f894.firebaseapp.com",
    projectId: "lifeline-connect-1f894",
    storageBucket: "lifeline-connect-1f894.firebasestorage.app",
    messagingSenderId: "788298273987",
    appId: "1:788298273987:web:4d5598c5e839257ab3be76",
    measurementId: "G-77ZYP9EL09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
