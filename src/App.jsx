import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppBar,
  Badge,
  Box,
  Card,
  CardContent,
  Container,
  CssBaseline,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarIcon from "@mui/icons-material/Star";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import MapIcon from "@mui/icons-material/Map";
import RouteIcon from "@mui/icons-material/Route";
import { AchievementDialog, AchievementWall } from "./components/Achievements";
import { AuthControls } from "./components/AuthControls";
import { BeerDialog } from "./components/BeerDialog";
import { MemoBeerItem, MemoBreweryCard } from "./components/BeerList";
import { FilterPanel } from "./components/FilterPanel";
import { VenueMap } from "./components/Map";
import { PixelBackdrop, PixelSprite } from "./components/PixelArt";
import { RoutePlanner } from "./components/RoutePlanner";
import { FestivalDialog } from "./components/FestivalDialog";
import { HistoryView } from "./components/HistoryView";
import { Leaderboards } from "./components/Leaderboards";
import { Splash } from "./components/Splash";
import { ACHIEVEMENTS } from "./data/achievements";
import { DEFAULT_FILTERS, applyFilters } from "./filters";
import { FESTIVALS, festivalStats, findBeer, getFestival } from "./festivals";
import { useAuth } from "./hooks/useAuth";
import { useFestivalProgress } from "./hooks/useFestivalProgress";
import { useDebouncedValue, useLocalStorage } from "./hooks/useLocalStorage";
import {
  activeFestivalKey,
  DEFAULT_FESTIVAL_SLUG,
  festivalStorageKey,
  hasFestivalActivity,
  loadFestivalProgress,
  migrateLegacyStorage,
  displayNameKey,
  festivalChosenKey,
  ratedCountFrom,
  readChosenFestival,
  shareScoreboardKey,
  splashStorageKey,
} from "./lib/storage";
import { mergeAllFestivalsForUser } from "./lib/sync";
import { PIXEL_FONT, theme } from "./theme";

migrateLegacyStorage();

export default function App() {
  const auth = useAuth();
  const [activeSlug, setActiveSlug] = useLocalStorage(activeFestivalKey(), DEFAULT_FESTIVAL_SLUG);
  const festival = getFestival(activeSlug) ?? FESTIVALS[0];
  const stats = festivalStats(festival);
  const [displayName, setDisplayName] = useLocalStorage(displayNameKey(), "");
  const [shareScoreboard, setShareScoreboard] = useLocalStorage(shareScoreboardKey(), true);
  const [signInOpen, setSignInOpen] = useState(false);
  if (auth.user && signInOpen) setSignInOpen(false);
  const requestSignIn = () => setSignInOpen(true);
  const { progress, patch, replaceProgress, resetMilestones, cloudReady } = useFestivalProgress(
    festival.slug,
    auth.user,
    { displayName, shareScoreboard },
  );

  const [filters, setFilters] = useLocalStorage(
    festivalStorageKey(festival.slug, "filters"),
    DEFAULT_FILTERS,
  );
  const [plannedBeers, setPlannedBeers] = useLocalStorage(
    festivalStorageKey(festival.slug, "plannedBeers"),
    [],
  );
  const [minRating, setMinRating] = useLocalStorage(
    festivalStorageKey(festival.slug, "routeMinRating"),
    4.1,
  );
  const [startSession, setStartSession] = useLocalStorage(
    festivalStorageKey(festival.slug, "routeStartSession"),
    "green",
  );
  const [openedBeerId, setOpenedBeerId] = useState(null);
  const [tab, setTab] = useState("beers");
  const [query, setQuery] = useState("");
  const [festivalOpen, setFestivalOpen] = useState(false);
  const [allProgress, setAllProgress] = useState(() =>
    Object.fromEntries(FESTIVALS.map((item) => [item.slug, loadFestivalProgress(item.slug)])),
  );
  const [splashOpen, setSplashOpen] = useState(() => {
    try {
      return sessionStorage.getItem(splashStorageKey()) !== "1";
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
    document.title = splashOpen ? "Beerfest Tracker" : `${festival.name} · Beerfest Tracker`;
  }, [festival.name, splashOpen]);

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

  const togglePlan = useCallback(
    (beerId) => {
      setPlannedBeers((current) =>
        current.includes(beerId) ? current.filter((id) => id !== beerId) : [...current, beerId],
      );
    },
    [setPlannedBeers],
  );

  const resetAchievements = useCallback(() => {
    activeRef.current = null;
    resetMilestones();
    setQueue([]);
    setActiveAchievement(null);
    setTab("beers");
  }, [resetMilestones]);

  const tapRef = useRef({ count: 0, lastTap: 0 });
  const handleTitleTap = useCallback(() => {
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

  const selectFestival = useCallback(
    (slug) => {
      const next = getFestival(slug);
      if (!next) return;
      setActiveSlug(next.slug);
      setQuery("");
      setTab("beers");
      try {
        localStorage.setItem(festivalChosenKey(), next.slug);
      } catch {
        /* ignore */
      }
    },
    [setActiveSlug],
  );

  const enterFestival = useCallback(
    (slug) => {
      selectFestival(slug);
      setSplashOpen(false);
      try {
        sessionStorage.setItem(splashStorageKey(), "1");
      } catch {
        /* ignore */
      }
    },
    [selectFestival],
  );

  const debouncedQuery = useDebouncedValue(query, 100);
  const effectiveFilters = useMemo(
    () => ({ ...DEFAULT_FILTERS, ...filters, ...(tab === "favorites" ? { status: "favorites" } : {}) }),
    [filters, tab],
  );
  const result = useMemo(
    () =>
      applyFilters(
        effectiveFilters,
        {
          drunkBeers: progress.drunkBeers,
          favoriteBeers: progress.favoriteBeers,
          plannedBeers,
          beerRatings: progress.beerRatings,
        },
        debouncedQuery,
        festival.breweries,
      ),
    [effectiveFilters, progress, plannedBeers, debouncedQuery, festival.breweries],
  );
  const resultCount = result.groups.reduce((n, group) => n + group.beers.length, 0);
  const openBeer = useCallback((id) => setOpenedBeerId(id), []);
  const openedEntry = useMemo(
    () => (openedBeerId == null ? null : findBeer(festival, openedBeerId)),
    [festival, openedBeerId],
  );
  const hasStands = useMemo(
    () => festival.breweries.some((brewery) => brewery.stand),
    [festival],
  );

  const unlocked = useMemo(
    () => ACHIEVEMENTS.filter((item) => progress.achievedMilestones.includes(item.count)),
    [progress.achievedMilestones],
  );
  const hasAchievements = unlocked.length > 0;

  useEffect(() => {
    if (!hasAchievements && tab === "achievements") setTab("beers");
    if (!hasStands && (tab === "map" || tab === "route")) setTab("beers");
  }, [hasAchievements, hasStands, tab]);

  const visitedCount = FESTIVALS.filter((item) => hasFestivalActivity(allProgress[item.slug])).length;
  const showList = tab === "beers" || tab === "favorites";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PixelBackdrop />
      <Box sx={{ flexGrow: 1, position: "relative", zIndex: 1 }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "rgba(7, 7, 15, 0.7)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(0, 229, 255, 0.3)",
            boxShadow: "0 4px 30px rgba(0, 229, 255, 0.12)",
          }}
        >
          <Toolbar>
            <Box
              onClick={handleTitleTap}
              onTouchEnd={handleTitleTap}
              sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 }, userSelect: "none" }}
            >
              <Box className="pop-in" style={{ "--d": "100ms" }}>
                <PixelSprite sprite="mug" size={52} depth={5} />
              </Box>
              <Typography
                component="span"
                className="pop-in"
                style={{ "--d": "250ms" }}
                sx={{
                  fontFamily: PIXEL_FONT,
                  fontWeight: 700,
                  fontSize: { xs: "1.2rem", sm: "1.6rem" },
                  color: "#ff2bd6",
                  textShadow: "1px 1px 0 #a0128a, 2px 2px 0 #6a0b5c, 3px 3px 0 #2a1458",
                }}
              >
                ×
              </Typography>
              <Box className="pop-in" style={{ "--d": "400ms" }}>
                <PixelSprite sprite="logo" size={76} depth={7} />
              </Box>
            </Box>
            <AuthControls auth={auth} signInOpen={signInOpen} onSignInClose={() => setSignInOpen(false)} />
            <Typography variant="body2" sx={{ fontFamily: PIXEL_FONT, fontWeight: 600, fontSize: "0.85rem", ml: 1, fontVariantNumeric: "tabular-nums" }}>
              {ratedCount} rated · {progress.drunkBeers.length}/{stats.beerCount} tried
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 3 }, mb: 3, px: { xs: 1.5, sm: 3 } }}>
          <Box
            onClick={() => setFestivalOpen(true)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {[festival.name, festival.venue, festival.dateLabel || festival.date]
                .filter(Boolean)
                .join(" · ")}
            </Typography>
            <ExpandMoreIcon fontSize="small" color="action" />
          </Box>
          {tab !== "history" && (
            <TextField
              fullWidth
              variant="outlined"
              placeholder={
                tab === "leaderboards"
                  ? "Search people, beers, breweries..."
                  : "Search beers, breweries, styles..."
              }
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
          <Tabs
            value={tab}
            onChange={(_event, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ mb: 3, px: 0.5, pb: 1 }}
          >
            <Tab value="beers" icon={<SportsBarIcon />} label="All Beers" iconPosition="start" />
            <Tab
              value="favorites"
              icon={
                <Badge badgeContent={progress.favoriteBeers.length} color="secondary">
                  <StarIcon />
                </Badge>
              }
              label="Favorites"
              iconPosition="start"
            />
            {hasStands && <Tab value="map" icon={<MapIcon />} label="Map" iconPosition="start" />}
            {hasStands && <Tab value="route" icon={<RouteIcon />} label="Route" iconPosition="start" />}
            {hasAchievements && (
              <Tab
                value="achievements"
                icon={
                  <Badge badgeContent={unlocked.length} color="secondary">
                    <EmojiEventsIcon />
                  </Badge>
                }
                label="Achievements"
                iconPosition="start"
              />
            )}
            <Tab value="leaderboards" icon={<LeaderboardIcon />} label="Boards" iconPosition="start" />
            <Tab
              value="history"
              icon={
                <Badge badgeContent={visitedCount} color="secondary">
                  <HistoryIcon />
                </Badge>
              }
              label="History"
              iconPosition="start"
            />
          </Tabs>
          <Box key={tab} className="fade-swap">
          {showList && (
            <>
              <FilterPanel
                festival={festival}
                filters={effectiveFilters}
                onChange={(next) =>
                  setFilters(tab === "favorites" ? { ...next, status: filters.status } : next)
                }
                resultCount={resultCount}
              />
              {resultCount === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                  {tab === "favorites" && progress.favoriteBeers.length === 0
                    ? "No favorite beers yet. Star some beers to see them here!"
                    : "No beers match these filters."}
                </Typography>
              ) : result.flat ? (
                <Card sx={{ mb: 3 }}>
                  <CardContent sx={{ px: { xs: 1.25, sm: 2 } }}>
                    {result.flat.map(({ beer, brewery }) => (
                      <MemoBeerItem
                        key={beer.id}
                        festival={festival}
                        beer={beer}
                        brewery={brewery}
                        showBrewery
                        isDrunk={progress.drunkBeers.includes(beer.id)}
                        isFavorite={progress.favoriteBeers.includes(beer.id)}
                        isPlanned={plannedBeers.includes(beer.id)}
                        rating={progress.beerRatings[beer.id] || 0}
                        onToggleDrunk={toggleDrunk}
                        onToggleFavorite={toggleFavorite}
                        onTogglePlan={togglePlan}
                        onRatingChange={changeRating}
                        onOpen={openBeer}
                      />
                    ))}
                  </CardContent>
                </Card>
              ) : (
                result.groups.map(({ brewery, beers }, index) => (
                  <MemoBreweryCard
                    key={brewery.id}
                    index={index}
                    festival={festival}
                    brewery={brewery}
                    beers={beers}
                    drunkBeers={progress.drunkBeers}
                    favoriteBeers={progress.favoriteBeers}
                    plannedBeers={plannedBeers}
                    beerRatings={progress.beerRatings}
                    onToggleDrunk={toggleDrunk}
                    onToggleFavorite={toggleFavorite}
                    onTogglePlan={togglePlan}
                    onRatingChange={changeRating}
                    onOpen={openBeer}
                  />
                ))
              )}
            </>
          )}
          {tab === "map" && <VenueMap festival={festival} drunkBeers={progress.drunkBeers} />}
          {tab === "route" && (
            <RoutePlanner
              festival={festival}
              drunkBeers={progress.drunkBeers}
              favoriteBeers={progress.favoriteBeers}
              minRating={minRating}
              startSession={startSession}
              onMinRatingChange={setMinRating}
              onStartSessionChange={setStartSession}
              plannedBeers={plannedBeers}
              onPlannedChange={setPlannedBeers}
              onToggleDrunk={toggleDrunk}
            />
          )}
          {hasAchievements && tab === "achievements" && <AchievementWall achievements={unlocked} />}
          {tab === "leaderboards" && (
            <Leaderboards
              festival={festival}
              progress={progress}
              query={debouncedQuery}
              self={auth.user ? { id: auth.user.uid, email: auth.user.email } : null}
              authReady={auth.ready}
              cloudReady={cloudReady}
              displayName={displayName}
              onDisplayNameChange={setDisplayName}
              sharing={shareScoreboard}
              onSharingChange={setShareScoreboard}
              onOpenBeer={openBeer}
              onSignIn={requestSignIn}
            />
          )}
          {tab === "history" && (
            <HistoryView
              allProgress={allProgress}
              activeSlug={festival.slug}
              onSelectFestival={selectFestival}
            />
          )}
          </Box>
        </Container>
      </Box>
      <BeerDialog
        festival={festival}
        entry={openedEntry}
        drunkBeers={progress.drunkBeers}
        favoriteBeers={progress.favoriteBeers}
        plannedBeers={plannedBeers}
        beerRatings={progress.beerRatings}
        onRatingChange={changeRating}
        onToggleDrunk={toggleDrunk}
        onToggleFavorite={toggleFavorite}
        onTogglePlan={togglePlan}
        onClose={() => setOpenedBeerId(null)}
      />
      <Splash
        open={splashOpen}
        festivals={FESTIVALS}
        resumeSlug={
          readChosenFestival() ??
          (hasFestivalActivity(allProgress[festival.slug]) ? festival.slug : null)
        }
        allProgress={allProgress}
        onSelect={enterFestival}
      />
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
    </ThemeProvider>
  );
}
