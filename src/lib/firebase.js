export function isAuthConfigured() {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID,
  );
}

let cached = null;

export async function getFirebase() {
  if (!isAuthConfigured()) return null;
  if (cached) return cached;

  const { initializeApp } = await import("firebase/app");
  const { connectAuthEmulator, getAuth } = await import("firebase/auth");
  const { connectFirestoreEmulator, getFirestore } = await import("firebase/firestore");

  const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || undefined,
  });

  const auth = getAuth(app);
  const db = getFirestore(app);
  if (import.meta.env.VITE_FIREBASE_EMULATOR === "1") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }

  cached = { app, auth, db };
  return cached;
}

export function continueUrl() {
  const base = import.meta.env.BASE_URL || "/";
  return `${window.location.origin}${base}`;
}
