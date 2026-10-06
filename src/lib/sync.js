import { FESTIVALS } from "../festivals";
import { getFirebase } from "./firebase";
import {
  loadFestivalProgress,
  mergeFestivalProgress,
  saveFestivalProgress,
} from "./storage";

function festivalDoc(db, uid, slug) {
  return import("firebase/firestore").then(({ doc }) =>
    doc(db, "users", uid, "festivals", slug),
  );
}

export async function fetchRemoteFestival(uid, slug) {
  const firebase = await getFirebase();
  if (!firebase) return null;
  const { getDoc } = await import("firebase/firestore");
  const ref = await festivalDoc(firebase.db, uid, slug);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function writeRemoteFestival(uid, slug, progress) {
  const firebase = await getFirebase();
  if (!firebase) return;
  const { setDoc, serverTimestamp } = await import("firebase/firestore");
  const ref = await festivalDoc(firebase.db, uid, slug);
  await setDoc(
    ref,
    {
      drunkBeers: progress.drunkBeers ?? [],
      favoriteBeers: progress.favoriteBeers ?? [],
      beerRatings: progress.beerRatings ?? {},
      achievedMilestones: progress.achievedMilestones ?? [],
      sessionFilter: progress.sessionFilter ?? "all",
      hideDrunkBeers: Boolean(progress.hideDrunkBeers),
      showOnlyUnrated: Boolean(progress.showOnlyUnrated),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function mergeAllFestivalsForUser(uid) {
  const merged = {};
  for (const festival of FESTIVALS) {
    const local = loadFestivalProgress(festival.slug);
    const remote = await fetchRemoteFestival(uid, festival.slug);
    const next = mergeFestivalProgress(local, remote);
    saveFestivalProgress(festival.slug, next);
    await writeRemoteFestival(uid, festival.slug, next);
    merged[festival.slug] = next;
  }
  return merged;
}
