import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCqztdL0GuIBidvKCpjE00Y05HCUEb8hVc",
  authDomain: "hopehub-20f48.firebaseapp.com",
  projectId: "hopehub-20f48",
  storageBucket: "hopehub-20f48.firebasestorage.app",
  messagingSenderId: "890399093834",
  appId: "1:890399093834:web:f0f55b19d8e3a42afa62b3",
  measurementId: "G-GQ5BTXMHEK"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);