import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import { MemoBreweryCard } from "./components/BeerList";
import { theme } from "./theme";
import { pixelCheckboxProps } from "./components/PixelUI";
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
  const [sessionFilter, setSessionFilter] = useLocalStorage(
    `${STORAGE_PREFIX}sessionFilter`,
    "all",
  );
  const [drunkBeers, setDrunkBeers] = useLocalStorage(`${STORAGE_PREFIX}drunkBeers`, []);
  const [favoriteBeers, setFavoriteBeers] = useLocalStorage(
    `${STORAGE_PREFIX}favoriteBeers`,
    [],
  );
  const [hideDrunkBeers, setHideDrunkBeers] = useLocalStorage(
    `${STORAGE_PREFIX}hideDrunkBeers`,
    false,
  );
  const [beerRatings, setBeerRatings] = useLocalStorage(`${STORAGE_PREFIX}beerRatings`, {});
  const [showOnlyUnrated, setShowOnlyUnrated] = useLocalStorage(
    `${STORAGE_PREFIX}showOnlyUnrated`,
    false,
  );
  const [minGrade, setMinGrade] = useLocalStorage(`${STORAGE_PREFIX}routeMinGrade`, "A-");
  const [startStand, setStartStand] = useLocalStorage(`${STORAGE_PREFIX}routeStartStand`, 1);
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
  const filteredBreweries = useMemo(() => {
    const needle = debouncedQuery.toLowerCase().trim();
    if (!needle) return breweries;
    return breweries.filter(
      (brewery) =>
        brewery.name.toLowerCase().includes(needle) ||
        brewery.beers.some((beer) => beer.name.toLowerCase().includes(needle)),
    );
  }, [debouncedQuery]);

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
            <PixelSprite sprite="mug" size={44} depth={5} sx={{ mr: 2 }} />
            <Typography
              variant="h6"
              component="div"
              onClick={handleTitleTap}
              onTouchEnd={handleTitleTap}
              sx={{
                flexGrow: 1,
                userSelect: "none",
                fontWeight: 700,
                letterSpacing: "0.04em",
                background: "linear-gradient(90deg, #00e5ff, #ff2bd6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              RAISE THE BAR
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: "\"Silkscreen\", monospace", fontSize: "0.7rem" }}>
              {ratedCount} rated · {drunkBeers.length}/{TOTAL_BEERS} tried
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 3, mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Serpier × Raise the Bar · Ridehuset, Aarhus · fredag 9. oktober 2026
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fri bar 17–21 — planlæg hvad I skal smage
          </Typography>
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2,
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {[
              ["all", "All sessions"],
              ["green", "Green"],
              ["yellow", "Yellow"],
              ["red", "Red"],
              ["nolo", "No/Low"],
            ].map(([value, label]) => (
              <Chip
                key={value}
                label={label}
                onClick={() => setSessionFilter(value)}
                color={sessionFilter === value ? "primary" : "default"}
                variant={sessionFilter === value ? "filled" : "outlined"}
              />
            ))}
          </Box>
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
                  {...pixelCheckboxProps}
                  checked={hideDrunkBeers}
                  onChange={(event) => setHideDrunkBeers(event.target.checked)}
                  color="primary"
                />
              }
              label="Hide already drunk beers"
            />
            <FormControlLabel
              control={
                <Checkbox
                  {...pixelCheckboxProps}
                  checked={showOnlyUnrated}
                  onChange={(event) => setShowOnlyUnrated(event.target.checked)}
                  color="primary"
                />
              }
              label="Show only unrated drunk beers"
            />
          </Box>
          {tab === 0 && (
            <Box>
              {filteredBreweries.length === 0 ? (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 4 }}
                >
                  {`No breweries found matching "${debouncedQuery}"`}
                </Typography>
              ) : (
                filteredBreweries.map((brewery) => (
                  <MemoBreweryCard
                    key={brewery.id}
                    brewery={brewery}
                    drunkBeers={drunkBeers}
                    favoriteBeers={favoriteBeers}
                    beerRatings={beerRatings}
                    onToggleDrunk={toggleDrunk}
                    onToggleFavorite={toggleFavorite}
                    onRatingChange={changeRating}
                    hideDrunkBeers={hideDrunkBeers}
                    showOnlyUnrated={showOnlyUnrated}
                    sessionFilter={sessionFilter}
                  />
                ))
              )}
            </Box>
          )}
          {tab === 1 && (
            <Box>
              {favoriteBeers.length === 0 ? (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 4 }}
                >
                  No favorite beers yet. Star some beers to see them here!
                </Typography>
              ) : (
                filteredBreweries.map((brewery) => (
                  <MemoBreweryCard
                    key={brewery.id}
                    brewery={brewery}
                    drunkBeers={drunkBeers}
                    favoriteBeers={favoriteBeers}
                    beerRatings={beerRatings}
                    onToggleDrunk={toggleDrunk}
                    onToggleFavorite={toggleFavorite}
                    onRatingChange={changeRating}
                    showOnlyFavorites
                    hideDrunkBeers={hideDrunkBeers}
                    showOnlyUnrated={showOnlyUnrated}
                    sessionFilter={sessionFilter}
                  />
                ))
              )}
            </Box>
          )}
          {tab === 2 && <VenueMap drunkBeers={drunkBeers} />}
          {tab === 3 && (
            <RoutePlanner
              drunkBeers={drunkBeers}
              favoriteBeers={favoriteBeers}
              minGrade={minGrade}
              startStand={startStand}
              onMinGradeChange={setMinGrade}
              onStartStandChange={setStartStand}
              onToggleDrunk={toggleDrunk}
            />
          )}
          {hasAchievements && tab === 4 && <AchievementWall achievements={unlocked} />}
        </Container>
      </Box>
      <Splash open={splashOpen} onDismiss={dismissSplash} />
      <AchievementDialog
        achievement={activeAchievement}
        onClose={() => setActiveAchievement(null)}
      />
    </ThemeProvider>
  );
}
