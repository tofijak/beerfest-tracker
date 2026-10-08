import { useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Chip, TextField, Typography } from "@mui/material";
import {
  BOARDS,
  DEFAULT_PREFS,
  ENTITIES,
  MIN_CHOICES,
  buildLeaderboard,
  describeBoard,
  emptyMessage,
  normalizePrefs,
} from "../leaderboards";
import { useFestivalRoster } from "../hooks/useFestivalRoster";
import { mergeSelf, personFromProgress, publicName, rosterErrorMessage, withoutPerson } from "../lib/roster";
import { festivalStorageKey } from "../lib/storage";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { PixelBar, StandBadge, StyleBadge } from "./PixelUI";
import { ratingColor } from "../utils";
import { BODY_FONT, PIXEL_FONT } from "../theme";

const PAGE = 20;
const MEMBER_PREVIEW = 8;
const MEDAL = { 1: "#ffd23f", 2: "#d5def2", 3: "#ff9a6b" };

function ChoiceRow({ label, options, value, onChange }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontFamily: PIXEL_FONT, fontSize: "0.7rem", mb: 1, color: "#ffd23f" }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {options.map(([id, text]) => {
          const selected = value === id;
          return (
            <Chip
              key={id}
              label={text}
              onClick={() => onChange(id)}
              color={selected ? "primary" : "default"}
              variant={selected ? "filled" : "outlined"}
            />
          );
        })}
      </Box>
    </Box>
  );
}

function scoreColor(row) {
  if (row.tone === "rating") return ratingColor(row.score);
  if (row.tone === "stars") return "#ffd23f";
  if (row.tone === "ratings") return "#ff2bd6";
  return "#00e5ff";
}

function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`;
}

function StatusCard({ title, body, action }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {body}
        </Typography>
        {action ? <Box sx={{ mt: 2 }}>{action}</Box> : null}
      </CardContent>
    </Card>
  );
}

function RankBadge({ rank }) {
  const medal = MEDAL[rank];
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        fontFamily: PIXEL_FONT,
        fontSize: "0.85rem",
        bgcolor: medal ?? "#241a4d",
        color: medal ? "#07070f" : "#00e5ff",
        border: "3px solid #07070f",
        boxShadow: "3px 3px 0 #2a1458",
      }}
    >
      {rank}
    </Box>
  );
}

export function Leaderboards({
  festival,
  progress,
  query,
  self,
  authReady,
  cloudReady,
  displayName,
  onDisplayNameChange,
  sharing,
  onSharingChange,
  onOpenBeer,
  onSignIn,
}) {
  const roster = useFestivalRoster(festival.slug, self?.id ?? null, authReady);
  const [stored, setStored] = useLocalStorage(festivalStorageKey(festival.slug, "leaderboard"), DEFAULT_PREFS);
  const prefs = normalizePrefs(stored);
  const setPref = (patch) => setStored((current) => normalizePrefs({ ...normalizePrefs(current), ...patch }));

  const selfPerson = useMemo(() => {
    if (!self?.id) return null;
    return personFromProgress(self.id, progress, displayName, self.email);
  }, [self, progress, displayName]);

  const people = useMemo(() => {
    if (roster.status !== "ready") return [];
    if (self?.id && !sharing) return withoutPerson(roster.people, self.id);
    if (self?.id && sharing && cloudReady && selfPerson) return mergeSelf(roster.people, selfPerson);
    return roster.people;
  }, [roster, self, sharing, cloudReady, selfPerson]);

  const result = useMemo(
    () =>
      buildLeaderboard({
        festival,
        people,
        entity: prefs.entity,
        board: prefs.board,
        minRatings: prefs.minRatings,
        query,
        selfId: self?.id ?? null,
      }),
    [festival, people, prefs.entity, prefs.board, prefs.minRatings, query, self?.id],
  );

  const signature = `${festival.slug}|${prefs.entity}|${prefs.board}|${prefs.minRatings}|${query}`;
  const [view, setView] = useState({ signature, expanded: null, showAll: false, showMembers: false });
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const shown = view.signature === signature ? view : { signature, expanded: null, showAll: false, showMembers: false };
  if (view.signature !== signature) setView(shown);

  const visible = shown.showAll ? result.rows : result.rows.slice(0, PAGE);
  const boardName = publicName(displayName, self?.email);

  const commitName = () => {
    const next = nameDraft.trim();
    const fallback = publicName("", self?.email);
    onDisplayNameChange(!next || next === fallback ? "" : publicName(next));
    setEditingName(false);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
        <Typography variant="h6">Leaderboards</Typography>
        {roster.status === "ready" ? <Chip label="Live" size="small" color="success" /> : null}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Everyone signed in at {festival.name}. Names and check-ins are shared on this board. Emails stay
        private.
      </Typography>

      {roster.status === "unconfigured" ? (
        <StatusCard
          title="Shared board is off"
          body="Leaderboards add up every signed-in check-in at this festival. Add the Firebase magic-link config and publish the Firestore rules to turn the board on."
        />
      ) : null}

      {roster.status === "signed-out" ? (
        <StatusCard
          title="Sign in to see the board"
          body="The board ranks everyone who has checked a beer in at this festival. Sign in and your pours join the list."
          action={
            <Button variant="contained" onClick={onSignIn}>
              Sign in
            </Button>
          }
        />
      ) : null}

      {roster.status === "loading" ? (
        <Typography variant="body2" color="text.secondary" role="status">
          Loading the board…
        </Typography>
      ) : null}

      {roster.status === "error" ? (
        <StatusCard
          title="Board unavailable"
          body={rosterErrorMessage(roster.error)}
          action={
            <Button variant="outlined" onClick={roster.retry}>
              Try again
            </Button>
          }
        />
      ) : null}

      {roster.status === "ready" ? (
        <>
          <ChoiceRow
            label="Rank"
            options={ENTITIES}
            value={prefs.entity}
            onChange={(entity) => setPref({ entity })}
          />
          <ChoiceRow
            label="Board"
            options={BOARDS}
            value={prefs.board}
            onChange={(board) => setPref({ board })}
          />
          {prefs.board.startsWith("avg") ? (
            <ChoiceRow
              label="Minimum ratings"
              options={MIN_CHOICES}
              value={prefs.minRatings}
              onChange={(minRatings) => setPref({ minRatings })}
            />
          ) : null}

          {self?.id && sharing ? (
            <Box sx={{ mb: 2 }}>
              {editingName ? (
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  label="Your name on the board"
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  onBlur={commitName}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                  }}
                  helperText="Emails stay off the board."
                />
              ) : (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                  <Typography variant="body2">
                    You · {boardName}
                    {result.self
                      ? ` · ${plural(result.self.drinkCount, "drink", "drinks")} · ${
                          result.self.average == null ? "no ratings yet" : `avg ${result.self.average.toFixed(2)}`
                        }`
                      : ""}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setNameDraft(displayName || boardName);
                      setEditingName(true);
                    }}
                  >
                    Change name
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => onSharingChange(false)}>
                    Leave the board
                  </Button>
                </Box>
              )}
            </Box>
          ) : null}

          {self?.id && !sharing ? (
            <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Your check-ins are off this board.
              </Typography>
              <Button size="small" variant="contained" onClick={() => onSharingChange(true)}>
                Join the board
              </Button>
            </Box>
          ) : null}

          <Typography variant="body2" sx={{ mb: 0.5 }}>
            {describeBoard(prefs.entity, prefs.board, prefs.minRatings)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {rosterLine(result)}
            {query?.trim() && result.rows.length > 0
              ? ` ${plural(result.rows.length, "match", "matches")} for “${query.trim()}”.`
              : ""}
          </Typography>

          {result.empty ? (
            <StatusCard title="Nothing on this board" body={emptyMessage(result.empty, query)} />
          ) : (
            <>
              <Card sx={{ mb: 2 }}>
                <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
                  {visible.map((row, index) => (
                    <BoardRow
                      key={row.key}
                      row={row}
                      index={index}
                      expanded={shown.expanded === row.key}
                      showMembers={shown.showMembers}
                      onToggle={() =>
                        setView((current) => ({
                          ...current,
                          expanded: current.expanded === row.key ? null : row.key,
                          showMembers: false,
                        }))
                      }
                      onShowMembers={() => setView((current) => ({ ...current, showMembers: true }))}
                      onOpenBeer={onOpenBeer}
                    />
                  ))}
                </Box>
              </Card>
              {result.rows.length > PAGE ? (
                <Button variant="outlined" onClick={() => setView((current) => ({ ...current, showAll: !current.showAll }))}>
                  {shown.showAll ? `Show the top ${PAGE}` : `Show the rest (${result.rows.length - PAGE})`}
                </Button>
              ) : null}
            </>
          )}
        </>
      ) : null}
    </Box>
  );
}

function rosterLine(result) {
  const people = plural(result.rosterCount, "person", "people");
  if (result.rosterCount === 0) return "Nobody is on the board yet.";
  if (result.activeCount === 0) return `${people} signed in · nobody has checked a beer in yet.`;
  if (result.activeCount === result.rosterCount) {
    return `${people} on the board.`;
  }
  return `${people} on the board · ${result.activeCount} have checked a beer in.`;
}

function BoardRow({ row, index, expanded, showMembers, onToggle, onShowMembers, onOpenBeer }) {
  const color = scoreColor(row);
  const canOpenBeer = row.kind === "beer" && row.beerId != null;
  const canExpand = row.members.length > 0;
  const interactive = canOpenBeer || canExpand;
  const shownMembers = showMembers ? row.members : row.members.slice(0, MEMBER_PREVIEW);
  const open = () => {
    if (canOpenBeer) onOpenBeer(row.beerId);
    else if (canExpand) onToggle();
  };

  return (
    <Box
      component="li"
      className="rise"
      style={{ "--i": Math.min(index, 8) }}
      sx={{
        borderBottom: "1px solid rgba(0, 229, 255, 0.18)",
        bgcolor: row.isSelf ? "rgba(0, 229, 255, 0.08)" : "transparent",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Box
        component={interactive ? "button" : "div"}
        type={interactive ? "button" : undefined}
        onClick={interactive ? open : undefined}
        aria-expanded={canExpand ? expanded : undefined}
        aria-label={
          canOpenBeer
            ? `Open ${row.name}, rank ${row.rank}, ${row.scoreText} ${row.unit}`
            : canExpand
              ? `${expanded ? "Hide" : "Show"} beers for ${row.name}, rank ${row.rank}, ${row.scoreText} ${row.unit}`
              : undefined
        }
        sx={{
          width: "100%",
          textAlign: "left",
          color: "inherit",
          background: "transparent",
          border: 0,
          cursor: interactive ? "pointer" : "default",
          font: "inherit",
          display: "flex",
          gap: 1.25,
          alignItems: "center",
          px: 1.5,
          py: 1.25,
          "&:hover": interactive ? { bgcolor: "rgba(0, 229, 255, 0.06)" } : undefined,
          "&:focus-visible": { outline: "2px solid #00e5ff", outlineOffset: -2 },
        }}
      >
        <RankBadge rank={row.rank} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
            {row.kind === "style" && row.style ? <StyleBadge category={row.style} /> : null}
            {row.kind === "brewery" ? <StandBadge stand={row.stand} /> : null}
            <Typography component="span" fontWeight={700} sx={{ wordBreak: "break-word" }}>
              {row.name}
            </Typography>
            {row.isSelf ? <Chip label="You" size="small" color="primary" /> : null}
            {row.youLabel ? <Chip label={row.youLabel} size="small" variant="outlined" /> : null}
          </Box>
          {row.detail ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {row.detail}
            </Typography>
          ) : null}
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            {row.note}
          </Typography>
          <Box sx={{ mt: 0.75 }}>
            <PixelBar value={Math.round(row.bar * 8)} total={8} color={color} segments={8} />
          </Box>
        </Box>
        <Box sx={{ textAlign: "center", minWidth: 72, flexShrink: 0 }}>
          <Box
            sx={{
              fontFamily: BODY_FONT,
              fontWeight: 700,
              fontSize: "1.35rem",
              lineHeight: 1,
              color,
            }}
          >
            {row.scoreText}
          </Box>
          <Box sx={{ fontSize: "0.85rem", color: "text.secondary" }}>{row.unit}</Box>
        </Box>
      </Box>
      {expanded && canExpand ? (
        <Box sx={{ pl: { xs: 2, sm: 7 }, pr: 2, pb: 1.25 }}>
          {shownMembers.map((member) => (
            <Box
              key={member.key}
              component="button"
              type="button"
              onClick={() => onOpenBeer(member.beerId)}
              sx={{
                width: "100%",
                textAlign: "left",
                color: "inherit",
                background: "transparent",
                border: 0,
                borderTop: "1px solid rgba(0, 229, 255, 0.12)",
                cursor: "pointer",
                font: "inherit",
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
                py: 0.75,
                "&:hover": { color: "#00e5ff" },
                "&:focus-visible": { outline: "2px solid #00e5ff", outlineOffset: -2 },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography component="span" fontWeight={600} sx={{ display: "block", wordBreak: "break-word" }}>
                  {member.name}
                </Typography>
                {member.detail ? (
                  <Typography variant="caption" color="text.secondary">
                    {member.detail}
                  </Typography>
                ) : null}
              </Box>
              <Typography component="span" sx={{ color: "#00e5ff", flexShrink: 0 }}>
                {member.scoreText}
              </Typography>
            </Box>
          ))}
          {row.members.length > MEMBER_PREVIEW && !showMembers ? (
            <Button size="small" onClick={onShowMembers} sx={{ mt: 0.5 }}>
              Show all {row.members.length} beers
            </Button>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}
