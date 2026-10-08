import { useCallback, useEffect, useState } from "react";
import { isAuthConfigured } from "../lib/firebase";
import { safeSlug } from "../lib/roster";
import { subscribeRoster } from "../lib/rosterSync";

export function useFestivalRoster(slug, userId, authReady) {
  const configured = isAuthConfigured();
  const [attempt, setAttempt] = useState(0);
  const requestKey = configured && authReady && userId ? `${slug}|${userId}|${attempt}` : "";
  const [remote, setRemote] = useState(null);

  useEffect(() => {
    if (!requestKey || !safeSlug(slug)) return undefined;
    return subscribeRoster(slug, (next) => setRemote({ key: requestKey, ...next }));
  }, [requestKey, slug]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  if (!configured) return { status: "unconfigured", people: [], error: null, retry };
  if (!authReady) return { status: "loading", people: [], error: null, retry };
  if (!userId) return { status: "signed-out", people: [], error: null, retry };
  if (!safeSlug(slug)) {
    return {
      status: "error",
      people: [],
      error: new Error("This festival can't host a board."),
      retry,
    };
  }
  if (!remote || remote.key !== requestKey) return { status: "loading", people: [], error: null, retry };
  return { status: remote.status, people: remote.people, error: remote.error, retry };
}
