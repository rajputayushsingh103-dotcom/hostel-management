import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPcL2g4oqB75SzhZlUhT97OkVOMPiGnU0",
  authDomain: "hostel-71588428.firebaseapp.com",
  projectId: "hostel-71588428",
  storageBucket: "hostel-71588428.firebasestorage.app",
  messagingSenderId: "489589423899",
  appId: "1:489589423899:web:b6ad85e0df5d041f351dbe"
};

// Safe initialization (Vite Hot-Reload par error nahi aayegi)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export default app;