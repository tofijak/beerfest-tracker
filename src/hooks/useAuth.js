import { useCallback, useEffect, useState } from "react";
import { continueUrl, getFirebase, isAuthConfigured } from "../lib/firebase";
import { emailForSignInKey } from "../lib/storage";

export function useAuth() {
  const configured = isAuthConfigured();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!configured);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);
  const [pendingLink, setPendingLink] = useState(false);
  const [needsEmail, setNeedsEmail] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!configured) return undefined;

    let unsub = () => {};
    let cancelled = false;

    (async () => {
      try {
        const firebase = await getFirebase();
        if (!firebase || cancelled) return;
        const {
          isSignInWithEmailLink,
          signInWithEmailLink,
          onAuthStateChanged,
        } = await import("firebase/auth");

        if (isSignInWithEmailLink(firebase.auth, window.location.href)) {
          const storedEmail = window.localStorage.getItem(emailForSignInKey());
          if (!storedEmail) {
            setPendingLink(true);
            setNeedsEmail(true);
            setReady(true);
            return;
          }
          setPendingLink(true);
          await signInWithEmailLink(firebase.auth, storedEmail, window.location.href);
          window.localStorage.removeItem(emailForSignInKey());
          window.history.replaceState(null, "", continueUrl());
          setPendingLink(false);
        }

        unsub = onAuthStateChanged(firebase.auth, (nextUser) => {
          setUser(nextUser);
          setReady(true);
        });
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(err?.message ?? "Could not finish sign-in.");
          setPendingLink(false);
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsub();
    };
  }, [configured]);

  const completeLink = useCallback(async (email) => {
    setBusy(true);
    setError(null);
    try {
      const firebase = await getFirebase();
      const { signInWithEmailLink } = await import("firebase/auth");
      await signInWithEmailLink(firebase.auth, email, window.location.href);
      window.localStorage.removeItem(emailForSignInKey());
      window.history.replaceState(null, "", continueUrl());
      setNeedsEmail(false);
      setPendingLink(false);
    } catch (err) {
      console.error(err);
      setError(err?.message ?? "Could not finish sign-in.");
    } finally {
      setBusy(false);
    }
  }, []);

  const sendLink = useCallback(async (email) => {
    setBusy(true);
    setError(null);
    setEmailSent(false);
    try {
      const firebase = await getFirebase();
      const { sendSignInLinkToEmail } = await import("firebase/auth");
      await sendSignInLinkToEmail(firebase.auth, email, {
        url: continueUrl(),
        handleCodeInApp: true,
      });
      window.localStorage.setItem(emailForSignInKey(), email);
      setEmailSent(true);
      return true;
    } catch (err) {
      console.error(err);
      setError(err?.message ?? "Could not send the magic link.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const firebase = await getFirebase();
    if (!firebase) return;
    const { signOut } = await import("firebase/auth");
    await signOut(firebase.auth);
    setEmailSent(false);
  }, []);

  return {
    configured,
    user,
    ready,
    sendLink,
    completeLink,
    logout,
    emailSent,
    error,
    pendingLink,
    needsEmail,
    busy,
  };
}
