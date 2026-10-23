import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseProjectId } from "./verify-firebase-id-token.js";

export function parseServiceAccount(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    try {
      return JSON.parse(Buffer.from(trimmed, "base64").toString("utf8"));
    } catch {
      return null;
    }
  }
}

export function getAdminApp(env = process.env) {
  const existing = getApps()[0];
  if (existing) return existing;
  const credentials = parseServiceAccount(env.FIREBASE_SERVICE_ACCOUNT);
  if (!credentials) return null;
  return initializeApp({
    credential: cert(credentials),
    projectId: credentials.project_id || firebaseProjectId(env),
  });
}

export function getAdminDb(env = process.env) {
  const app = getAdminApp(env);
  return app ? getFirestore(app) : null;
}
