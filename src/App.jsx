import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AchievementDialog, AchievementWall } from "./components/Achievements";
import { AuthControls } from "./components/AuthControls";
import { MemoBreweryCard } from "./components/BeerList";
import { FestivalDialog } from "./components/FestivalDialog";
import { HistoryView } from "./components/HistoryView";
import { Splash } from "./components/Splash";
import { ACHIEVEMENTS } from "./data/achievements";
import { FESTIVALS, festivalStats, getFestival } from "./festivals";
import { useAuth } from "./hooks/useAuth";
import { useFestivalProgress } from "./hooks/useFestivalProgress";
import { useDebouncedValue, useLocalStorage } from "./hooks/useLocalStorage";
import {
  activeFestivalKey,
  DEFAULT_FESTIVAL_SLUG,
  hasFestivalActivity,
  loadFestivalProgress,
  migrateLegacyStorage,
  ratedCountFrom,
  splashStorageKey,
} from "./lib/storage";
import { mergeAllFestivalsForUser } from "./lib/sync";
import { sessionFilterValue } from "./utils";
import {
  Checkbox,
  Chip,
  EmptyState,
  IconBeer,
  IconButton,
  IconChevron,
  IconHistory,
  IconSearch,
  IconStar,
  IconSun,
  IconTrophy,
  Input,
  Segmented,
  useTheme,
} from "./ui";

migrateLegacyStorage();

export default function App() {
  const auth = useAuth();
  const { toggleTheme } = useTheme();
  const [activeSlug, setActiveSlug] = useLocalStorage(activeFestivalKey(), DEFAULT_FESTIVAL_SLUG);
  const festival = getFestival(activeSlug) ?? FESTIVALS[0];
  const stats = festivalStats(festival);
  const { progress, patch, replaceProgress, resetMilestones } = useFestivalProgress(
    festival.slug,
    auth.user,
  );

  const [tab, setTab] = useState("beers");
  const [query, setQuery] = useState("");
  const [festivalOpen, setFestivalOpen] = useState(false);
  const [allProgress, setAllProgress] = useState(() =>
    Object.fromEntries(FESTIVALS.map((item) => [item.slug, loadFestivalProgress(item.slug)])),
  );
  const [splashOpen, setSplashOpen] = useState(() => {
    try {
      return sessionStorage.getItem(splashStorageKey(festival.slug)) !== "1";
    } catch {
      return true;
    }
  });
  const [queue, setQueue] = useState([]);
  const [activeAchievement, setActiveAchievement] = useState(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeSlug !== festival.slug) setActiveSlug(festival.slug);
  }, [activeSlug, festival.slug, setActiveSlug]);

  useEffect(() => {
    document.title = `${festival.name} · Beerfest Tracker`;
  }, [festival.name]);

  useEffect(() => {
    setAllProgress((current) => ({ ...current, [festival.slug]: progress }));
  }, [festival.slug, progress]);

  useEffect(() => {
    if (!auth.user) return undefined;
    let cancelled = false;
    mergeAllFestivalsForUser(auth.user.uid)
      .then((merged) => {
        if (cancelled) return;
        setAllProgress((current) => ({ ...current, ...merged }));
        if (merged[festival.slug]) replaceProgress(festival.slug, merged[festival.slug]);
      })
      .catch((error) => console.error("Could not merge cloud ratings:", error));
    return () => {
      cancelled = true;
    };
  }, [auth.user, festival.slug, replaceProgress]);

  useEffect(() => {
    activeRef.current = activeAchievement;
  }, [activeAchievement]);

  const enqueueAchievement = useCallback((achievement) => {
    setQueue((current) => {
      const alreadyQueued = current.some((item) => item.count === achievement.count);
      const alreadyShowing = activeRef.current?.count === achievement.count;
      return alreadyQueued || alreadyShowing ? current : [...current, achievement];
    });
  }, []);

  const unlockMilestone = useCallback(
    (count) => {
      const achievement = ACHIEVEMENTS.find((item) => item.count === count);
      if (!achievement) return;
      patch((current) => {
        if (current.achievedMilestones.includes(count)) return current;
        enqueueAchievement(achievement);
        return {
          ...current,
          achievedMilestones: [...current.achievedMilestones, count].sort((a, b) => a - b),
        };
      });
    },
    [enqueueAchievement, patch],
  );

  useEffect(() => {
    if (!activeAchievement && queue.length > 0) {
      setActiveAchievement(queue[0]);
      setQueue((current) => current.slice(1));
    }
  }, [activeAchievement, queue]);

  const ratedCount = useMemo(() => ratedCountFrom(progress.beerRatings), [progress.beerRatings]);

  useEffect(() => {
    ACHIEVEMENTS.forEach(({ count }) => {
      if (ratedCount >= count) unlockMilestone(count);
    });
  }, [ratedCount, unlockMilestone]);

  const toggleDrunk = useCallback(
    (beerId) => {
      patch((current) => ({
        ...current,
        drunkBeers: current.drunkBeers.includes(beerId)
          ? current.drunkBeers.filter((id) => id !== beerId)
          : [...current.drunkBeers, beerId],
      }));
    },
    [patch],
  );

  const toggleFavorite = useCallback(
    (beerId) => {
      patch((current) => ({
        ...current,
        favoriteBeers: current.favoriteBeers.includes(beerId)
          ? current.favoriteBeers.filter((id) => id !== beerId)
          : [...current.favoriteBeers, beerId],
      }));
    },
    [patch],
  );

  const changeRating = useCallback(
    (beerId, rating) => {
      patch((current) => ({
        ...current,
        beerRatings: { ...current.beerRatings, [beerId]: rating },
      }));
    },
    [patch],
  );

  const resetAchievements = useCallback(() => {
    activeRef.current = null;
    resetMilestones();
    setQueue([]);
    setActiveAchievement(null);
    setTab("beers");
  }, [resetMilestones]);

  const tapRef = useRef({ count: 0, lastTap: 0 });
  const handleLogoTap = useCallback(() => {
    const now = Date.now();
    tapRef.current =
      now - tapRef.current.lastTap <= 600
        ? { lastTap: now, count: tapRef.current.count + 1 }
        : { lastTap: now, count: 1 };
    if (tapRef.current.count >= 3) {
      tapRef.current = { count: 0, lastTap: 0 };
      resetAchievements();
    }
  }, [resetAchievements]);

  const dismissSplash = useCallback(() => {
    setSplashOpen(false);
    try {
      sessionStorage.setItem(splashStorageKey(festival.slug), "1");
    } catch {
      /* ignore */
    }
  }, [festival.slug]);

  const selectFestival = useCallback(
    (slug) => {
      const next = getFestival(slug);
      if (!next) return;
      setActiveSlug(next.slug);
      setQuery("");
      setTab("beers");
      try {
        setSplashOpen(sessionStorage.getItem(splashStorageKey(next.slug)) !== "1");
      } catch {
        setSplashOpen(true);
      }
    },
    [setActiveSlug],
  );

  const debouncedQuery = useDebouncedValue(query, 100);
  const filteredBreweries = useMemo(() => {
    const needle = debouncedQuery.toLowerCase().trim();
    if (!needle) return festival.breweries;
    return festival.breweries.filter(
      (brewery) =>
        brewery.name.toLowerCase().includes(needle) ||
        brewery.beers.some((beer) => beer.name.toLowerCase().includes(needle)),
    );
  }, [debouncedQuery, festival.breweries]);

  const unlocked = useMemo(
    () => ACHIEVEMENTS.filter((item) => progress.achievedMilestones.includes(item.count)),
    [progress.achievedMilestones],
  );
  const hasAchievements = unlocked.length > 0;

  useEffect(() => {
    if (!hasAchievements && tab === "achievements") setTab("beers");
  }, [hasAchievements, tab]);

  const sessionFilters = useMemo(() => {
    if (!festival.sessions?.length) return [];
    return [
      { value: "all", label: "All" },
      ...festival.sessions.map((session) => ({
        value: sessionFilterValue(session),
        label: session.label,
      })),
    ];
  }, [festival.sessions]);

  const visitedCount = FESTIVALS.filter((item) => hasFestivalActivity(allProgress[item.slug])).length;
  const showSearch = tab === "beers" || tab === "favorites";
  const showFilters = showSearch;

  const navOptions = [
    { id: "beers", label: "Beers", icon: <IconBeer size={18} /> },
    {
      id: "favorites",
      label: "Stars",
      icon: <IconStar size={18} />,
      badge: progress.favoriteBeers.length,
    },
    ...(hasAchievements
      ? [{ id: "achievements", label: "Crew", icon: <IconTrophy size={18} />, badge: unlocked.length }]
      : []),
    { id: "history", label: "Passport", icon: <IconHistory size={18} />, badge: visitedCount },
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <IconButton aria-label="Beerfest Tracker" onClick={handleLogoTap}>
          <IconBeer />
        </IconButton>
        <button
          type="button"
          className="grow"
          onClick={() => setFestivalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            minWidth: 0,
            border: 0,
            background: "transparent",
            textAlign: "left",
          }}
        >
          <span
            className="display"
            style={{
              fontSize: "var(--fs-xl)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {festival.name}
          </span>
          <IconChevron size={18} />
        </button>
        <AuthControls auth={auth} />
        <IconButton aria-label="Toggle theme" onClick={toggleTheme}>
          <IconSun />
        </IconButton>
      </header>

      <main className="app-main">
        <p className="kicker">
          {[festival.venue, festival.dateLabel || festival.date].filter(Boolean).join(" · ")}
        </p>
        {festival.tagline ? <p className="lede">{festival.tagline}</p> : null}
        <p className="muted" style={{ marginTop: "-0.6rem", fontSize: "var(--fs-sm)" }}>
          <span className="mono">{ratedCount}</span> rated ·{" "}
          <span className="mono">
            {progress.drunkBeers.length}/{stats.beerCount}
          </span>{" "}
          tried
        </p>

        {showSearch ? (
          <Input
            icon={<IconSearch />}
            placeholder="Search breweries or beers"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search breweries or beers"
          />
        ) : null}

        {showFilters && sessionFilters.length > 0 ? (
          <div className="toolbar-row">
            {sessionFilters.map((filter) => (
              <Chip
                key={filter.value}
                as="button"
                type="button"
                active={progress.sessionFilter === filter.value}
                onClick={() => patch((current) => ({ ...current, sessionFilter: filter.value }))}
              >
                {filter.label}
              </Chip>
            ))}
          </div>
        ) : null}

        {showFilters ? (
          <div className="toolbar-row">
            <Checkbox
              checked={progress.hideDrunkBeers}
              onChange={(checked) => patch((current) => ({ ...current, hideDrunkBeers: checked }))}
              label="Hide tried"
            />
            <Checkbox
              checked={progress.showOnlyUnrated}
              onChange={(checked) => patch((current) => ({ ...current, showOnlyUnrated: checked }))}
              label="Unrated only"
            />
          </div>
        ) : null}

        {tab === "beers" &&
          (filteredBreweries.length === 0 ? (
            <EmptyState
              title="Nothing poured up"
              body={`No breweries match “${debouncedQuery}”.`}
            />
          ) : (
            filteredBreweries.map((brewery) => (
              <MemoBreweryCard
                key={brewery.id}
                brewery={brewery}
                festival={festival}
                drunkBeers={progress.drunkBeers}
                favoriteBeers={progress.favoriteBeers}
                beerRatings={progress.beerRatings}
                onToggleDrunk={toggleDrunk}
                onToggleFavorite={toggleFavorite}
                onRatingChange={changeRating}
                hideDrunkBeers={progress.hideDrunkBeers}
                showOnlyUnrated={progress.showOnlyUnrated}
                sessionFilter={progress.sessionFilter}
              />
            ))
          ))}

        {tab === "favorites" &&
          (progress.favoriteBeers.length === 0 ? (
            <EmptyState
              icon={<IconStar size={28} />}
              title="No favorites yet"
              body="Star a beer and it will glow here."
            />
          ) : (
            filteredBreweries.map((brewery) => (
              <MemoBreweryCard
                key={brewery.id}
                brewery={brewery}
                festival={festival}
                drunkBeers={progress.drunkBeers}
                favoriteBeers={progress.favoriteBeers}
                beerRatings={progress.beerRatings}
                onToggleDrunk={toggleDrunk}
                onToggleFavorite={toggleFavorite}
                onRatingChange={changeRating}
                showOnlyFavorites
                hideDrunkBeers={progress.hideDrunkBeers}
                showOnlyUnrated={progress.showOnlyUnrated}
                sessionFilter={progress.sessionFilter}
              />
            ))
          ))}

        {hasAchievements && tab === "achievements" ? (
          <AchievementWall achievements={unlocked} />
        ) : null}

        {tab === "history" ? (
          <HistoryView
            allProgress={allProgress}
            activeSlug={festival.slug}
            onSelectFestival={selectFestival}
          />
        ) : null}
      </main>

      <nav className="app-nav" aria-label="Primary">
        <Segmented options={navOptions} value={tab} onChange={setTab} />
      </nav>

      <Splash open={splashOpen} festival={festival} onDismiss={dismissSplash} />
      <AchievementDialog
        achievement={activeAchievement}
        onClose={() => setActiveAchievement(null)}
      />
      <FestivalDialog
        open={festivalOpen}
        onClose={() => setFestivalOpen(false)}
        activeSlug={festival.slug}
        allProgress={allProgress}
        onSelect={selectFestival}
      />
    </div>
  );
}
