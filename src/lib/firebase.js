import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCQiJLAjsroZQ5qEI9r66lXPkO5GhRhpa0",
  authDomain: "home-coffee-af62f.firebaseapp.com",
  projectId: "home-coffee-af62f",
  storageBucket: "home-coffee-af62f.firebasestorage.app",
  messagingSenderId: "962908399179",
  appId: "1:962908399179:web:f4b923e3d7fcf006064fce",
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const analyticsPromise = isSupported()
  .then((supported) => {
    if (!supported) return null;
    return getAnalytics(app);
  })
  .catch(() => null);