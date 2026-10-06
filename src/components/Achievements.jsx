import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slide,
  Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const DialogSlide = Slide;

export function AchievementDialog({ achievement, onClose }) {
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
          <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
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

export function AchievementWall({ achievements }) {
  if (achievements.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          The trophy wall awaits
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rate a few beers to meet the crew.
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
