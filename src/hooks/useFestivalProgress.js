import { useCallback, useEffect, useState } from "react";
import { deleteRoster, publishRoster } from "../lib/rosterSync";
import {
  loadFestivalProgress,
  mergeFestivalProgress,
  saveFestivalProgress,
} from "../lib/storage";
import { fetchRemoteFestival, writeRemoteFestival } from "../lib/sync";

export function useFestivalProgress(slug, user, options = {}) {
  const { displayName = "", shareScoreboard = true } = options;
  const userId = user?.uid ?? null;
  const email = user?.email ?? "";
  const [state, setState] = useState(() => ({
    slug,
    progress: loadFestivalProgress(slug),
  }));
  const [cloudReady, setCloudReady] = useState(!userId);

  if (state.slug !== slug) {
    setState({ slug, progress: loadFestivalProgress(slug) });
  }

  useEffect(() => {
    saveFestivalProgress(state.slug, state.progress);
  }, [state.slug, state.progress]);

  useEffect(() => {
    if (!userId) {
      setCloudReady(true);
      return undefined;
    }

    let cancelled = false;
    setCloudReady(false);

    (async () => {
      try {
        const remote = await fetchRemoteFestival(userId, slug);
        if (cancelled) return;
        setState((current) => {
          const local = current.slug === slug ? current.progress : loadFestivalProgress(slug);
          return { slug, progress: mergeFestivalProgress(local, remote) };
        });
      } catch (error) {
        console.error("Could not load cloud ratings:", error);
      } finally {
        if (!cancelled) setCloudReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, slug]);

  useEffect(() => {
    if (!userId || !cloudReady) return undefined;
    const timeout = setTimeout(() => {
      writeRemoteFestival(userId, state.slug, state.progress).catch((error) => {
        console.error("Could not save cloud ratings:", error);
      });
    }, 600);
    return () => clearTimeout(timeout);
  }, [userId, cloudReady, state.slug, state.progress]);

  useEffect(() => {
    if (!userId || !cloudReady) return undefined;
    if (!shareScoreboard) {
      deleteRoster(userId, state.slug).catch((error) => {
        console.error("Could not leave the leaderboard:", error);
      });
      return undefined;
    }
    const timeout = setTimeout(() => {
      publishRoster(userId, state.slug, state.progress, displayName, email).catch((error) => {
        console.error("Could not publish leaderboard:", error);
      });
    }, 600);
    return () => clearTimeout(timeout);
  }, [userId, cloudReady, shareScoreboard, displayName, email, state.slug, state.progress]);

  const patch = useCallback((updater) => {
    setState((current) => ({
      slug: current.slug,
      progress: typeof updater === "function" ? updater(current.progress) : updater,
    }));
  }, []);

  const replaceProgress = useCallback((slugToReplace, nextProgress) => {
    setState((current) =>
      current.slug === slugToReplace ? { slug: slugToReplace, progress: nextProgress } : current,
    );
  }, []);

  const resetMilestones = useCallback(() => {
    patch((current) => ({ ...current, achievedMilestones: [] }));
  }, [patch]);

  return {
    progress: state.progress,
    patch,
    replaceProgress,
    resetMilestones,
    cloudReady,
  };
}
