import { FESTIVALS } from "../festivals";
import { getFirebase } from "./firebase";
import { filterPayload, parseRosterDoc, rosterPayload, safeSlug } from "./roster";

function menuIds(slug) {
  const festival = FESTIVALS.find((item) => item.slug === slug);
  if (!festival) return null;
  const ids = new Set();
  for (const brewery of festival.breweries ?? []) {
    for (const beer of brewery.beers ?? []) ids.add(String(beer.id));
  }
  return ids;
}

async function rosterRef(db, slug, uid) {
  const { doc } = await import("firebase/firestore");
  return doc(db, "festivals", slug, "roster", uid);
}

export async function publishRoster(uid, slug, progress, displayName, email) {
  if (!safeSlug(slug) || typeof uid !== "string" || uid.length === 0) return;
  const knownIds = menuIds(slug);
  if (!knownIds) return;
  const firebase = await getFirebase();
  if (!firebase) return;

  const { setDoc, serverTimestamp } = await import("firebase/firestore");
  const ref = await rosterRef(firebase.db, slug, uid);
  const payload = filterPayload(rosterPayload(progress, displayName, email), knownIds);
  await setDoc(ref, { ...payload, hidden: false, updatedAt: serverTimestamp() });
}

export async function deleteRoster(uid, slug) {
  if (!safeSlug(slug) || typeof uid !== "string" || uid.length === 0) return;
  const firebase = await getFirebase();
  if (!firebase) return;
  const { deleteDoc } = await import("firebase/firestore");
  const ref = await rosterRef(firebase.db, slug, uid);
  await deleteDoc(ref);
}

export function subscribeRoster(slug, onChange) {
  let unsubscribe = () => {};
  let cancelled = false;

  if (!safeSlug(slug)) {
    onChange({
      status: "error",
      people: [],
      error: new Error("This festival can't host a board."),
    });
    return () => {};
  }

  getFirebase()
    .then(async (firebase) => {
      if (cancelled) return;
      if (!firebase) {
        onChange({ status: "unconfigured", people: [], error: null });
        return;
      }
      const { collection, onSnapshot } = await import("firebase/firestore");
      if (cancelled) return;
      unsubscribe = onSnapshot(
        collection(firebase.db, "festivals", slug, "roster"),
        (snap) => {
          if (cancelled) return;
          const people = [];
          for (const docSnap of snap.docs) {
            const person = parseRosterDoc(docSnap.id, docSnap.data());
            if (person) people.push(person);
          }
          onChange({ status: "ready", people, error: null });
        },
        (error) => {
          console.error("Could not load the festival board:", error);
          if (!cancelled) onChange({ status: "error", people: [], error });
        },
      );
    })
    .catch((error) => {
      console.error(error);
      if (!cancelled) onChange({ status: "error", people: [], error });
    });

  return () => {
    cancelled = true;
    unsubscribe();
  };
}
