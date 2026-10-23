import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import LoginIcon from "@mui/icons-material/Login";
import { FESTIVALS } from "../festivals";
import { buildExport } from "../lib/export";
import { loadFestivalProgress, mergeFestivalProgress } from "../lib/storage";
import { fetchRemoteFestival } from "../lib/sync";
import { exportUrl, festivalComment, syncAgentPrompt } from "../lib/syncGuide";

const preSx = {
  m: 0,
  p: 1.5,
  maxHeight: 420,
  overflow: "auto",
  bgcolor: "rgba(0, 0, 0, 0.45)",
  border: "1px solid rgba(0, 229, 255, 0.3)",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "0.8rem",
  lineHeight: 1.45,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((current) => (current === key ? null : current)), 1600);
    } catch {
      setCopied(null);
    }
  };
  return { copied, copy };
}

/** Remote Firestore docs for the signed-in user, fetched once per user + filter. */
function useRemoteFestivals(uid, slugs) {
  const key = `${uid ?? ""}|${slugs.join(",")}`;
  const [state, setState] = useState({ key: null, docs: {}, error: null });

  useEffect(() => {
    if (!uid) return undefined;
    let cancelled = false;
    Promise.all(slugs.map((slug) => fetchRemoteFestival(uid, slug).then((doc) => [slug, doc])))
      .then((pairs) => {
        if (!cancelled) setState({ key, docs: Object.fromEntries(pairs), error: null });
      })
      .catch((error) => {
        console.error("Could not load ratings for export:", error);
        if (!cancelled) setState({ key, docs: {}, error: error?.message ?? "Could not load ratings." });
      });
    return () => {
      cancelled = true;
    };
  }, [uid, slugs, key]);

  return { loading: Boolean(uid) && state.key !== key, docs: state.docs, error: state.key === key ? state.error : null };
}

function SyncGuide({ festival }) {
  const { copied, copy } = useCopy();
  const origin = window.location.origin;
  const prompt = syncAgentPrompt({
    origin,
    slug: festival?.slug,
    venue: festival?.venue,
    comment: festivalComment(festival),
  });

  return (
    <Card sx={{ mb: 3 }} id="untappd-sync-guide">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sync with Untappd
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Let your own AI agent (Grok Bot, ChatGPT agent, Claude with computer use, or any agent with a
          browser) check in the beers you rate here on your Untappd account. The agent signs in to Beerfest
          Tracker and Untappd in its own browser, reads this export on a schedule and checks in what is
          missing.
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Beerfest Tracker never asks for or stores your Untappd login. Only your agent signs in to
          Untappd, and you can sign it out any time.
        </Alert>
        <Box component="ol" sx={{ pl: 3, mt: 0, mb: 2, "& li": { mb: 0.75 } }}>
          <Typography component="li" variant="body2">
            Give your agent a browser and have it sign in here with a magic link (forward the email to it).
          </Typography>
          <Typography component="li" variant="body2">
            Have it sign in to Untappd as you. You type the password, not the app.
          </Typography>
          <Typography component="li" variant="body2">
            Schedule it every 15–30 minutes during festival hours with the prompt below. It reads{" "}
            <Box component="code" sx={{ fontSize: "0.85em", wordBreak: "break-all" }}>
              {exportUrl(origin, festival?.slug)}
            </Box>
            , keeps its own log by festival + beer, comments each check-in with the festival name, tells you when a check-in needs editing in the Untappd app, and never checks in a beer twice.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
          <Typography variant="overline">Agent prompt</Typography>
          <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => copy("prompt", prompt)}>
            {copied === "prompt" ? "Copied" : "Copy prompt"}
          </Button>
        </Box>
        <Box component="pre" id="untappd-sync-prompt" sx={preSx}>
          {prompt}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
          Full guide:{" "}
          <Link
            href="https://github.com/tofijak/beerfest-tracker/blob/main/docs/untappd-sync.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs/untappd-sync.md
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
}

export function ExportView({ auth, allProgress, displayName, festivalSlug, activeFestival, onSignIn, onBack }) {
  const { copied, copy } = useCopy();
  const unknownSlug = Boolean(festivalSlug) && !FESTIVALS.some((item) => item.slug === festivalSlug);
  const slugs = useMemo(
    () => FESTIVALS.filter((item) => !festivalSlug || item.slug === festivalSlug).map((item) => item.slug),
    [festivalSlug],
  );
  const cloud = auth.configured;
  const uid = cloud ? auth.user?.uid ?? null : null;
  const remote = useRemoteFestivals(uid, slugs);
  const signedOut = cloud && auth.ready && !auth.user;
  const waiting = cloud && (!auth.ready || remote.loading);

  const data = useMemo(() => {
    if (waiting || signedOut) return null;
    const entries = {};
    for (const slug of slugs) {
      const local = allProgress[slug] ?? loadFestivalProgress(slug);
      const doc = uid ? remote.docs[slug] : null;
      entries[slug] = { progress: mergeFestivalProgress(local, doc), updatedAt: doc?.updatedAt ?? null };
    }
    return buildExport({
      user: uid ? auth.user : null,
      displayName,
      entries,
      festivalSlug,
      source: uid ? "account" : "device",
    });
  }, [waiting, signedOut, slugs, allProgress, uid, remote.docs, auth.user, displayName, festivalSlug]);

  const json = data ? JSON.stringify(data, null, 2) : "";
  const total = data ? data.festivals.reduce((sum, item) => sum + item.ratings.length, 0) : 0;
  const rated = data
    ? data.festivals.reduce((sum, item) => sum + item.ratings.filter((row) => row.rating > 0).length, 0)
    : 0;

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `beerfest-ratings${festivalSlug ? `-${festivalSlug}` : ""}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const guideFestival = FESTIVALS.find((item) => item.slug === festivalSlug) ?? activeFestival;

  return (
    <Box>
      <Button variant="text" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 1.5 }}>
        Back
      </Button>
      <Typography variant="h6" gutterBottom>
        Export my ratings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {festivalSlug && !unknownSlug
          ? `Your ratings, stars and check-offs for ${guideFestival?.name ?? festivalSlug}.`
          : "Your ratings, stars and check-offs across every festival."}{" "}
        Only you can see this page.
      </Typography>

      {unknownSlug ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No festival with the slug “{festivalSlug}”. Known: {FESTIVALS.map((item) => item.slug).join(", ")}.
        </Alert>
      ) : null}

      {signedOut ? (
        <Card sx={{ mb: 3 }} id="ratings-export-signed-out">
          <CardContent>
            <Typography variant="body1" fontWeight={600} gutterBottom>
              Sign in to export your ratings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The export reads the ratings saved to your account. Sign in with a magic link, then come back
              to this page.
            </Typography>
            <Button variant="contained" startIcon={<LoginIcon />} onClick={onSignIn}>
              Sign in
            </Button>
          </CardContent>
        </Card>
      ) : waiting ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }} id="ratings-export-loading">
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Loading your ratings…
          </Typography>
        </Box>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {remote.error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Could not load ratings from your account: {remote.error}
              </Alert>
            ) : null}
            {!uid ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Showing ratings saved on this device.
              </Alert>
            ) : null}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                {rated} rated · {total} beers in export
              </Typography>
              <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => copy("json", json)}>
                {copied === "json" ? "Copied" : "Copy"}
              </Button>
              <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={download}>
                Download
              </Button>
            </Box>
            <Box
              component="pre"
              id="ratings-export-json"
              data-status={remote.error ? "error" : "ready"}
              data-source={data?.source}
              sx={preSx}
            >
              {json}
            </Box>
          </CardContent>
        </Card>
      )}

      <SyncGuide festival={guideFestival} />
    </Box>
  );
}
