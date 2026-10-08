import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { FESTIVALS, festivalStats, knownBeerIds } from "../festivals";
import { hasFestivalActivity, ratedCountFrom, ratingsOnMenu } from "../lib/storage";

export function FestivalDialog({ open, onClose, activeSlug, allProgress, onSelect }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Pick a festival</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Ratings stay on the festival you poured them at. Switch anytime.
        </Typography>
        <List>
          {FESTIVALS.map((festival) => {
            const stats = festivalStats(festival);
            const progress = allProgress[festival.slug];
            const visited = hasFestivalActivity(progress);
            const rated = ratedCountFrom(ratingsOnMenu(progress?.beerRatings, knownBeerIds(festival)));
            return (
              <ListItemButton
                key={festival.slug}
                selected={festival.slug === activeSlug}
                onClick={() => {
                  onSelect(festival.slug);
                  onClose();
                }}
              >
                <ListItemText
                  primary={`${festival.name}${festival.edition ? ` ${festival.edition}` : ""}`}
                  secondary={[
                    festival.venue,
                    festival.dateLabel || festival.date,
                    `${stats.beerCount} beers`,
                    visited ? `${rated} rated` : "not started",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              </ListItemButton>
            );
          })}
        </List>
      </DialogContent>
    </Dialog>
  );
}
