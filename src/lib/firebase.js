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
  const { getAuth } = await import("firebase/auth");
  const { getFirestore } = await import("firebase/firestore");

  const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || undefined,
  });

  cached = {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
  return cached;
}

export function continueUrl() {
  const base = import.meta.env.BASE_URL || "/";
  return `${window.location.origin}${base}`;
}
