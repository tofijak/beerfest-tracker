import { Avatar, Button, Card, EmptyState, IconTrophy, Modal } from "../ui";

export function AchievementDialog({ achievement, onClose }) {
  return (
    <Modal open={!!achievement} onClose={onClose} celebrate>
      {achievement ? (
        <>
          <p className="kicker">Unlocked</p>
          <h2 className="display" style={{ margin: "0 0 0.5rem", fontSize: "var(--fs-3xl)" }}>
            {achievement.name}
          </h2>
          <p className="lede">{achievement.subtitle}</p>
          <Avatar src={achievement.image} alt={achievement.name} size="lg" />
          <p className="muted" style={{ margin: "1.25rem 0 1.5rem" }}>
            {achievement.description}
          </p>
          <Button variant="primary" onClick={onClose}>
            Cheers!
          </Button>
        </>
      ) : null}
    </Modal>
  );
}

export function AchievementWall({ achievements }) {
  if (achievements.length === 0) {
    return (
      <EmptyState
        icon={<IconTrophy size={32} />}
        title="The trophy wall awaits"
        body="Rate a few beers to meet the crew."
      />
    );
  }

  return (
    <div className="achieve-grid">
      {achievements.map((achievement) => (
        <Card key={achievement.count} padding="sm" className="achieve-card">
          <img src={achievement.image} alt={achievement.name} />
          <div style={{ padding: "0.9rem 0.75rem 0.5rem" }}>
            <h3 className="display" style={{ margin: 0, fontSize: "var(--fs-xl)" }}>
              {achievement.name}
            </h3>
            <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "var(--fs-sm)" }}>
              {achievement.subtitle}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
