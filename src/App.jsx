import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slider,
  Slide,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SearchIcon from "@mui/icons-material/Search";
import { Splash } from "./components/Splash";
import { ACHIEVEMENTS } from "./data/achievements";
import { breweries } from "./data/beers";
import { useDebouncedValue, useLocalStorage } from "./hooks/useLocalStorage";
import {
  SESSION_META,
  beerMatchesSession,
  formatBeerMeta,
  untappdSearchUrl,
} from "./utils";

const STORAGE_PREFIX = "greenSession.serpier.";
const SPLASH_KEY = `${STORAGE_PREFIX}splashSeen`;
const TOTAL_BEERS = breweries.reduce((sum, brewery) => sum + brewery.beers.length, 0);

const theme = createTheme({
  palette: {
    primary: { main: "#1b5e20" },
    secondary: { main: "#f9a825" },
  },
});

const DialogSlide = Slide;

function ratedCountFrom(ratings) {
  return Object.values(ratings).filter((value) => typeof value === "number" && value > 0).length;
}

function SessionChip({ session, size = "small" }) {
  const meta = SESSION_META[session] ?? SESSION_META.all;
  return (
    <Chip
      label={meta.label}
      size={size}
      sx={{
        height: 22,
        fontWeight: 600,
        bgcolor: meta.color,
        color: session === "yellow" ? "#3e2723" : "#fff",
      }}
    />
  );
}

function BeerItem({
  beer,
  brewery,
  isDrunk,
  isFavorite,
  rating,
  onToggleDrunk,
  onToggleFavorite,
  onRatingChange,
}) {
  const meta = formatBeerMeta(beer);

  return (
    <ListItem
      sx={{
        borderLeft: isDrunk ? "4px solid #4caf50" : "none",
        bgcolor: isDrunk ? "rgba(76, 175, 80, 0.05)" : "transparent",
        alignItems: "flex-start",
      }}
    >
      <ListItemIcon sx={{ minWidth: 42, mt: 0.5 }}>
        <Checkbox
          checked={isDrunk}
          onChange={() => onToggleDrunk(beer.id)}
          color="success"
        />
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: isDrunk ? "line-through" : "none",
                fontWeight: isFavorite ? "bold" : "normal",
              }}
            >
              {beer.name}
            </Typography>
            <SessionChip session={beer.session} />
            {beer.name !== "TBA" && (
              <IconButton
                href={untappdSearchUrl(beer.name, brewery.name)}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
        secondary={
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
            {meta && (
              <Typography variant="body2" color="text.secondary">
                {meta}
              </Typography>
            )}
            {beer.notes && (
              <Typography variant="caption" color="text.secondary">
                {beer.notes}
              </Typography>
            )}
            {isDrunk && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 1, mb: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ minWidth: "3rem" }}
                  >
                    Rating:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" sx={{ minWidth: "2.5rem" }}>
                    {rating > 0 ? rating.toFixed(2) : "0.00"}
                  </Typography>
                </Box>
                <Slider
                  value={rating || 0}
                  onChange={(_event, value) => {
                    const next = typeof value === "number" ? Math.round(value * 4) / 4 : 0;
                    onRatingChange(beer.id, next);
                  }}
                  min={0}
                  max={5}
                  step={0.25}
                  marks={[
                    { value: 0, label: "0" },
                    { value: 1, label: "1" },
                    { value: 2, label: "2" },
                    { value: 3, label: "3" },
                    { value: 4, label: "4" },
                    { value: 5, label: "5" },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => value.toFixed(2)}
                  sx={{
                    width: "100%",
                    maxWidth: { xs: "100%", sm: "300px" },
                    "& .MuiSlider-thumb": { width: 24, height: 24 },
                    "& .MuiSlider-mark": { display: { xs: "none", sm: "block" } },
                    "& .MuiSlider-markLabel": { fontSize: "0.75rem" },
                  }}
                />
              </Box>
            )}
          </Box>
        }
      />
      <IconButton
        onClick={() => onToggleFavorite(beer.id)}
        color={isFavorite ? "warning" : "default"}
        sx={{ mt: 0.5 }}
      >
        {isFavorite ? <StarIcon /> : <StarBorderIcon />}
      </IconButton>
    </ListItem>
  );
}

const MemoBeerItem = memo(BeerItem);

function BreweryCard({
  brewery,
  drunkBeers,
  favoriteBeers,
  beerRatings,
  onToggleDrunk,
  onToggleFavorite,
  onRatingChange,
  showOnlyFavorites = false,
  hideDrunkBeers = false,
  showOnlyUnrated = false,
  sessionFilter = "all",
}) {
  let beers = brewery.beers.filter((beer) => beerMatchesSession(beer, sessionFilter));
  if (showOnlyFavorites) beers = beers.filter((beer) => favoriteBeers.includes(beer.id));
  if (showOnlyUnrated) {
    beers = beers.filter(
      (beer) => drunkBeers.includes(beer.id) && beerRatings[beer.id] === undefined,
    );
  } else if (hideDrunkBeers) {
    beers = beers.filter((beer) => !drunkBeers.includes(beer.id));
  }

  if (beers.length === 0) return null;

  const tried = beers.filter((beer) => drunkBeers.includes(beer.id)).length;
  const locationLabel = brewery.stand
    ? `${brewery.location} · stand ${brewery.stand}`
    : brewery.location;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="h6" component="h2">
                {brewery.name}
              </Typography>
              {brewery.noLow ? <Chip label="No/Low" size="small" /> : null}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {locationLabel}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`${tried}/${beers.length} tried`}
            color={tried === beers.length ? "success" : "default"}
            size="small"
          />
        </Box>
        <Divider sx={{ my: 1 }} />
        <List dense>
          {beers.map((beer) => (
            <MemoBeerItem
              key={beer.id}
              beer={beer}
              brewery={brewery}
              isDrunk={drunkBeers.includes(beer.id)}
              isFavorite={favoriteBeers.includes(beer.id)}
              rating={beerRatings[beer.id] || 0}
              onToggleDrunk={onToggleDrunk}
              onToggleFavorite={onToggleFavorite}
              onRatingChange={onRatingChange}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

const MemoBreweryCard = memo(BreweryCard);

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
          bgcolor: "#c8e6c9",
          backgroundImage: "linear-gradient(135deg, #c8e6c9, #f9a825)",
          backgroundColor: "#c8e6c9",
          backgroundBlendMode: "multiply",
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
    if (!hasAchievements && tab === 2) setTab(0);
  }, [hasAchievements, tab]);

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
              Green Session Beer Tracker
            </Typography>
            <Typography variant="body2">
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
            centered
            sx={{ mb: 2 }}
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
          {hasAchievements && tab === 2 && <AchievementWall achievements={unlocked} />}
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
