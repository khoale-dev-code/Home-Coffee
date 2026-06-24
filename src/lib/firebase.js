import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyCQiJLAjsroZQ5qEI9r66lXPkO5GhRhpa0",

  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "home-coffee-af62f.firebaseapp.com",

  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    "home-coffee-af62f",

  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "home-coffee-af62f.firebasestorage.app",

  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "962908399179",

  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:962908399179:web:f4b923e3d7fcf006064fce",

  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createFirestore() {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
      ignoreUndefinedProperties: true,
    });
  } catch (error) {
    console.warn("[Firebase] initializeFirestore failed, fallback:", error);
    return getFirestore(app);
  }
}

export const auth = getAuth(app);
export const db = createFirestore();
export const storage = getStorage(app);

export const analyticsPromise =
  typeof window === "undefined"
    ? Promise.resolve(null)
    : isSupported()
        .then((supported) => {
          if (!supported) return null;
          return getAnalytics(app);
        })
        .catch(() => null);