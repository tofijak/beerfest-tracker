import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Slide,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import StarIcon from "@mui/icons-material/Star";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SearchIcon from "@mui/icons-material/Search";
import MapIcon from "@mui/icons-material/Map";
import RouteIcon from "@mui/icons-material/Route";
import { MemoBeerItem, MemoBreweryCard } from "./components/BeerList";
import { BeerDialog } from "./components/BeerDialog";
import { FilterPanel } from "./components/FilterPanel";
import { DEFAULT_FILTERS, applyFilters } from "./filters";
import { PIXEL_FONT, theme } from "./theme";
import { PixelBackdrop, PixelSprite } from "./components/PixelArt";
import { Splash } from "./components/Splash";
import { VenueMap } from "./components/Map";
import { RoutePlanner } from "./components/RoutePlanner";
import { ACHIEVEMENTS } from "./data/achievements";
import { breweries } from "./data/beers";
import { useDebouncedValue, useLocalStorage } from "./hooks/useLocalStorage";

const STORAGE_PREFIX = "greenSession.serpier.";
const SPLASH_KEY = `${STORAGE_PREFIX}splashSeen`;
const TOTAL_BEERS = breweries.reduce((sum, brewery) => sum + brewery.beers.length, 0);

const DialogSlide = Slide;

function ratedCountFrom(ratings) {
  return Object.values(ratings).filter((value) => typeof value === "number" && value > 0).length;
}

function AchievementDialog({ achievement, onClose }) {
  return (
    <Dialog
      open={!!achievement}
      onClose={onClose}
      TransitionComponent={DialogSlide}
      keepMounted
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          textAlign: "center",
          borderRadius: { xs: 0, sm: 4 },
          p: { xs: 3, sm: 2 },
          backgroundImage: "linear-gradient(135deg, #0b1a2e, #2a0f3a)",
          border: "1px solid rgba(255, 43, 214, 0.5)",
          boxShadow: "0 0 40px rgba(255, 43, 214, 0.3)",
        },
      }}
    >
      {achievement && (
        <>
          <DialogTitle
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
          >
            <EmojiEventsIcon color="secondary" fontSize="large" />
            {achievement.name}
          </DialogTitle>
          <DialogContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {achievement.subtitle}
            </Typography>
            <Box
              component="img"
              src={achievement.image}
              alt={achievement.name}
              sx={{
                width: "70%",
                maxWidth: 280,
                aspectRatio: "1",
                objectFit: "cover",
                borderRadius: "50%",
                boxShadow: 6,
                mb: 2,
                bgcolor: "#fff",
              }}
            />
            <Typography variant="body1" color="text.secondary">
              {achievement.description}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              onClick={onClose}
              variant="contained"
              color="primary"
              size="large"
              sx={{ px: 4, borderRadius: 999 }}
            >
              Cheers!
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

function AchievementWall({ achievements }) {
  if (achievements.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          The Serpier trophy wall awaits
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rate a few beers to meet the Ridehuset crew.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {achievements.map((achievement) => (
        <Grid key={achievement.count} size={{ xs: 12, sm: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardMedia
              component="img"
              image={achievement.image}
              alt={achievement.name}
              sx={{ height: 280, objectFit: "cover" }}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {achievement.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {achievement.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState("");
  const [drunkBeers, setDrunkBeers] = useLocalStorage(`${STORAGE_PREFIX}drunkBeers`, []);
  const [favoriteBeers, setFavoriteBeers] = useLocalStorage(
    `${STORAGE_PREFIX}favoriteBeers`,
    [],
  );
  const [beerRatings, setBeerRatings] = useLocalStorage(`${STORAGE_PREFIX}beerRatings`, {});
  const [filters, setFilters] = useLocalStorage(`${STORAGE_PREFIX}filters`, DEFAULT_FILTERS);
  const [openedBeerId, setOpenedBeerId] = useState(null);
  const [plannedBeers, setPlannedBeers] = useLocalStorage(`${STORAGE_PREFIX}plannedBeers`, []);
  const [minRating, setMinRating] = useLocalStorage(`${STORAGE_PREFIX}routeMinRating`, 4.1);
  const [startSession, setStartSession] = useLocalStorage(`${STORAGE_PREFIX}routeStartSession`, "green");
  const [achievedMilestones, setAchievedMilestones] = useLocalStorage(
    `${STORAGE_PREFIX}achievedMilestones`,
    [],
  );
  const [splashOpen, setSplashOpen] = useState(() => {
    try {
      return sessionStorage.getItem(SPLASH_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const [queue, setQueue] = useState([]);
  const [activeAchievement, setActiveAchievement] = useState(null);
  const activeRef = useRef(null);

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
      setAchievedMilestones((current) =>
        current.includes(count)
          ? current
          : (enqueueAchievement(achievement), [...current, count].sort((a, b) => a - b)),
      );
    },
    [enqueueAchievement, setAchievedMilestones],
  );

  useEffect(() => {
    if (!activeAchievement && queue.length > 0) {
      setActiveAchievement(queue[0]);
      setQueue((current) => current.slice(1));
    }
  }, [activeAchievement, queue]);

  const ratedCount = useMemo(() => ratedCountFrom(beerRatings), [beerRatings]);

  useEffect(() => {
    ACHIEVEMENTS.forEach(({ count }) => {
      if (ratedCount >= count) unlockMilestone(count);
    });
  }, [ratedCount, unlockMilestone]);

  const toggleDrunk = useCallback((beerId) => {
    setDrunkBeers((current) =>
      current.includes(beerId) ? current.filter((id) => id !== beerId) : [...current, beerId],
    );
  }, [setDrunkBeers]);

  const toggleFavorite = useCallback(
    (beerId) => {
      setFavoriteBeers((current) =>
        current.includes(beerId)
          ? current.filter((id) => id !== beerId)
          : [...current, beerId],
      );
    },
    [setFavoriteBeers],
  );

  const togglePlan = useCallback(
    (beerId) => {
      setPlannedBeers((current) =>
        current.includes(beerId) ? current.filter((id) => id !== beerId) : [...current, beerId],
      );
    },
    [setPlannedBeers],
  );

  const changeRating = useCallback(
    (beerId, rating) => {
      setBeerRatings((current) => ({ ...current, [beerId]: rating }));
    },
    [setBeerRatings],
  );

  const resetAchievements = useCallback(() => {
    activeRef.current = null;
    setAchievedMilestones([]);
    setQueue([]);
    setActiveAchievement(null);
    setTab(0);
  }, [setAchievedMilestones]);

  const tapRef = useRef({ count: 0, lastTap: 0 });
  const handleTitleTap = useCallback(() => {
    const now = Date.now();
    const windowMs = 600;
    tapRef.current = (() => {
      const { lastTap, count } = tapRef.current;
      return now - lastTap <= windowMs
        ? { lastTap: now, count: count + 1 }
        : { lastTap: now, count: 1 };
    })();
    if (tapRef.current.count >= 3) {
      tapRef.current = { count: 0, lastTap: 0 };
      resetAchievements();
    }
  }, [resetAchievements]);

  const dismissSplash = useCallback(() => {
    setSplashOpen(false);
    try {
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const debouncedQuery = useDebouncedValue(query, 100);
  const effectiveFilters = useMemo(
    () => ({ ...DEFAULT_FILTERS, ...filters, ...(tab === 1 ? { status: "favorites" } : {}) }),
    [filters, tab],
  );
  const result = useMemo(
    () =>
      applyFilters(
        effectiveFilters,
        { drunkBeers, favoriteBeers, plannedBeers, beerRatings },
        debouncedQuery,
      ),
    [effectiveFilters, drunkBeers, favoriteBeers, plannedBeers, beerRatings, debouncedQuery],
  );
  const resultCount = result.groups.reduce((n, group) => n + group.beers.length, 0);
  const openBeer = useCallback((id) => setOpenedBeerId(id), []);
  const openedEntry = useMemo(() => {
    if (openedBeerId == null) return null;
    for (const brewery of breweries) {
      const beer = brewery.beers.find((item) => item.id === openedBeerId);
      if (beer) return { beer, brewery };
    }
    return null;
  }, [openedBeerId]);

  const unlocked = useMemo(
    () => ACHIEVEMENTS.filter((item) => achievedMilestones.includes(item.count)),
    [achievedMilestones],
  );
  const hasAchievements = unlocked.length > 0;

  useEffect(() => {
    if (!hasAchievements && tab === 4) setTab(0);
  }, [hasAchievements, tab]);

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
              <PixelSprite sprite="mug" size={52} depth={5} />
              <Typography
                component="span"
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
              <PixelSprite sprite="logo" size={76} depth={7} />
            </Box>
            <Typography variant="body2" sx={{ fontFamily: PIXEL_FONT, fontSize: "0.7rem" }}>
              {ratedCount} rated · {drunkBeers.length}/{TOTAL_BEERS} tried
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 3 }, mb: 3, px: { xs: 1.5, sm: 3 } }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Serpier × Raise the Bar · Ridehuset, Aarhus · fredag 9. oktober 2026
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fri bar 17–21 — planlæg hvad I skal smage
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search beers, breweries, styles..."
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
          <Tabs
            value={tab}
            onChange={(_event, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ mb: 3, px: 0.5, pb: 1 }}
          >
            <Tab icon={<SportsBarIcon />} label="All Beers" iconPosition="start" />
            <Tab
              icon={
                <Badge badgeContent={favoriteBeers.length} color="secondary">
                  <StarIcon />
                </Badge>
              }
              label="Favorites"
              iconPosition="start"
            />
            <Tab icon={<MapIcon />} label="Map" iconPosition="start" />
            <Tab icon={<RouteIcon />} label="Route" iconPosition="start" />
            {hasAchievements && (
              <Tab
                icon={
                  <Badge badgeContent={unlocked.length} color="secondary">
                    <EmojiEventsIcon />
                  </Badge>
                }
                label="Achievements"
                iconPosition="start"
              />
            )}
          </Tabs>
          {tab <= 1 && (
            <>
              <FilterPanel filters={effectiveFilters} onChange={setFilters} resultCount={resultCount} />
              {resultCount === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                  {tab === 1 && favoriteBeers.length === 0
                    ? "No favorite beers yet. Star some beers to see them here!"
                    : "No beers match these filters."}
                </Typography>
              ) : result.flat ? (
                <Card sx={{ mb: 3 }}>
                  <CardContent sx={{ px: { xs: 1.25, sm: 2 } }}>
                    {result.flat.map(({ beer, brewery }) => (
                      <MemoBeerItem
                        key={beer.id}
                        beer={beer}
                        brewery={brewery}
                        showBrewery
                        isDrunk={drunkBeers.includes(beer.id)}
                        isFavorite={favoriteBeers.includes(beer.id)}
                        isPlanned={plannedBeers.includes(beer.id)}
                        rating={beerRatings[beer.id] || 0}
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
                result.groups.map(({ brewery, beers }) => (
                  <MemoBreweryCard
                    key={brewery.id}
                    brewery={brewery}
                    beers={beers}
                    drunkBeers={drunkBeers}
                    favoriteBeers={favoriteBeers}
                    plannedBeers={plannedBeers}
                    beerRatings={beerRatings}
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
          {tab === 2 && <VenueMap drunkBeers={drunkBeers} />}
          {tab === 3 && (
            <RoutePlanner
              drunkBeers={drunkBeers}
              favoriteBeers={favoriteBeers}
              minRating={minRating}
              startSession={startSession}
              onMinRatingChange={setMinRating}
              onStartSessionChange={setStartSession}
              plannedBeers={plannedBeers}
              onPlannedChange={setPlannedBeers}
              onToggleDrunk={toggleDrunk}
            />
          )}
          {hasAchievements && tab === 4 && <AchievementWall achievements={unlocked} />}
        </Container>
      </Box>
      <BeerDialog
        entry={openedEntry}
        drunkBeers={drunkBeers}
        favoriteBeers={favoriteBeers}
        plannedBeers={plannedBeers}
        beerRatings={beerRatings}
        onRatingChange={changeRating}
        onToggleDrunk={toggleDrunk}
        onToggleFavorite={toggleFavorite}
        onTogglePlan={togglePlan}
        onClose={() => setOpenedBeerId(null)}
      />
      <Splash open={splashOpen} onDismiss={dismissSplash} />
      <AchievementDialog
        achievement={activeAchievement}
        onClose={() => setActiveAchievement(null)}
      />
    </ThemeProvider>
  );
}
