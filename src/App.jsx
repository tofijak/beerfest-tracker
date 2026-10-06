import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppBar,
  Badge,
  Box,
  Checkbox,
  Chip,
  Container,
  CssBaseline,
  FormControlLabel,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarIcon from "@mui/icons-material/Star";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
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

migrateLegacyStorage();

const theme = createTheme({
  palette: {
    primary: { main: "#1b5e20" },
    secondary: { main: "#f9a825" },
  },
});

export default function App() {
  const auth = useAuth();
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
      { value: "all", label: "All sessions" },
      ...festival.sessions.map((session) => ({
        value: sessionFilterValue(session),
        label: session.label,
      })),
    ];
  }, [festival.sessions]);

  const visitedCount = FESTIVALS.filter((item) => hasFestivalActivity(allProgress[item.slug])).length;
  const showFilters = tab === "beers" || tab === "favorites";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <SportsBarIcon sx={{ mr: 2 }} />
            <Typography
              variant="h6"
              component="div"
              onClick={handleTitleTap}
              onTouchEnd={handleTitleTap}
              sx={{ flexGrow: 1, userSelect: "none" }}
            >
              Beerfest Tracker
            </Typography>
            <AuthControls auth={auth} />
            <Typography variant="body2">
              {ratedCount} rated · {progress.drunkBeers.length}/{stats.beerCount} tried
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 3, mb: 3 }}>
          <Box
            onClick={() => setFestivalOpen(true)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
              mb: 0.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {[festival.name, festival.venue, festival.dateLabel || festival.date]
                .filter(Boolean)
                .join(" · ")}
            </Typography>
            <ExpandMoreIcon fontSize="small" color="action" />
          </Box>
          {festival.tagline ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {festival.tagline}
            </Typography>
          ) : (
            <Box sx={{ mb: 2 }} />
          )}
          {tab !== "history" && (
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search breweries..."
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
            centered
            sx={{ mb: 2 }}
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
          {showFilters && sessionFilters.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 2,
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {sessionFilters.map((filter) => (
                <Chip
                  key={filter.value}
                  label={filter.label}
                  onClick={() => patch((current) => ({ ...current, sessionFilter: filter.value }))}
                  color={progress.sessionFilter === filter.value ? "primary" : "default"}
                  variant={progress.sessionFilter === filter.value ? "filled" : "outlined"}
                />
              ))}
            </Box>
          )}
          {showFilters && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
                gap: 4,
                flexWrap: "wrap",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={progress.hideDrunkBeers}
                    onChange={(event) =>
                      patch((current) => ({ ...current, hideDrunkBeers: event.target.checked }))
                    }
                    color="primary"
                  />
                }
                label="Hide already drunk beers"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={progress.showOnlyUnrated}
                    onChange={(event) =>
                      patch((current) => ({ ...current, showOnlyUnrated: event.target.checked }))
                    }
                    color="primary"
                  />
                }
                label="Show only unrated drunk beers"
              />
            </Box>
          )}
          {tab === "beers" && (
            <Box>
              {filteredBreweries.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                  {`No breweries found matching "${debouncedQuery}"`}
                </Typography>
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
              )}
            </Box>
          )}
          {tab === "favorites" && (
            <Box>
              {progress.favoriteBeers.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                  No favorite beers yet. Star some beers to see them here!
                </Typography>
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
              )}
            </Box>
          )}
          {hasAchievements && tab === "achievements" && <AchievementWall achievements={unlocked} />}
          {tab === "history" && (
            <HistoryView
              allProgress={allProgress}
              activeSlug={festival.slug}
              onSelectFestival={selectFestival}
            />
          )}
        </Container>
      </Box>
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
    </ThemeProvider>
  );
}
