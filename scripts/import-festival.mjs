#!/usr/bin/env node
/**
 * Turn a beer list (CSV or JSON) into a festival file under src/festivals/<slug>.json.
 *
 * The app auto-loads every valid JSON file in that folder — no code changes needed.
 *
 * Usage:
 *   node scripts/import-festival.mjs --slug autumn-fest-2027 --name "Autumn Fest" \
 *     --date 2027-09-12 --venue "Some Venue, City" path/to/beers.csv
 *
 *   node scripts/import-festival.mjs --source path/to/festival.json
 *
 * CSV headers (case-insensitive; extras ignored):
 *   brewery, location, stand, noLow, beer, style, abv, session, notes
 *
 * JSON can be a full festival object ({ slug, name, date, venue, breweries })
 * or a wrapper ({ breweries: [...] }) plus the CLI flags below.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "src", "festivals");

const DEFAULT_SESSIONS = [
  { id: "green", label: "Green", color: "#2e7d32" },
  { id: "yellow", label: "Yellow", color: "#f9a825" },
  { id: "red", label: "Red", color: "#c62828" },
  { id: "all", label: "No/Low", color: "#546e7a" },
];

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        i += 1;
      }
    } else {
      args._.push(token);
    }
  }
  return args;
}

function kebab(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };
  const pushRow = () => {
    if (row.some((value) => value.trim() !== "")) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      pushCell();
    } else if (char === "\n") {
      pushCell();
      pushRow();
    } else if (char !== "\r") {
      cell += char;
    }
  }
  pushCell();
  pushRow();
  return rows;
}

function headerIndex(headers) {
  const aliases = {
    brewery: ["brewery", "brewery_name", "breweryname"],
    location: ["location", "country", "origin"],
    stand: ["stand", "booth"],
    noLow: ["nolow", "no_low", "nolo", "no-low"],
    beer: ["beer", "beer_name", "beername", "name"],
    style: ["style"],
    abv: ["abv"],
    session: ["session", "tier", "color"],
    notes: ["notes", "note", "comment"],
  };
  const map = {};
  for (const [field, names] of Object.entries(aliases)) {
    const index = headers.findIndex((header) => names.includes(header));
    if (index >= 0) map[field] = index;
  }
  return map;
}

function truthy(value) {
  return ["1", "true", "yes", "y"].includes(String(value).trim().toLowerCase());
}

function parseAbv(value) {
  if (value == null || String(value).trim() === "") return null;
  const num = Number(String(value).replace("%", "").trim());
  return Number.isFinite(num) ? num : null;
}

function parseSession(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return "green";
  if (["nolo", "no/low", "no-low", "all"].includes(raw)) return "all";
  return raw;
}

function breweriesFromCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error("CSV needs a header row and at least one beer.");
  const headers = rows[0].map((cell) => cell.trim().toLowerCase());
  const cols = headerIndex(headers);
  if (cols.brewery == null || cols.beer == null) {
    throw new Error("CSV must include brewery and beer columns.");
  }

  const byName = new Map();
  for (const row of rows.slice(1)) {
    const breweryName = row[cols.brewery]?.trim();
    const beerName = row[cols.beer]?.trim();
    if (!breweryName || !beerName) continue;
    if (!byName.has(breweryName)) {
      byName.set(breweryName, {
        name: breweryName,
        location: cols.location != null ? row[cols.location]?.trim() || "" : "",
        stand: cols.stand != null ? Number(row[cols.stand]) || row[cols.stand]?.trim() || null : null,
        noLow: cols.noLow != null ? truthy(row[cols.noLow]) : false,
        beers: [],
      });
    }
    const brewery = byName.get(breweryName);
    brewery.beers.push({
      name: beerName,
      style: cols.style != null ? row[cols.style]?.trim() || "" : "",
      abv: cols.abv != null ? parseAbv(row[cols.abv]) : null,
      session: cols.session != null ? parseSession(row[cols.session]) : "green",
      ...(cols.notes != null && row[cols.notes]?.trim()
        ? { notes: row[cols.notes].trim() }
        : {}),
    });
    if (cols.noLow != null && truthy(row[cols.noLow])) brewery.noLow = true;
  }

  return [...byName.values()].map((brewery, breweryIndex) => {
    const id = breweryIndex + 1;
    return {
      id,
      name: brewery.name,
      location: brewery.location,
      stand: brewery.stand,
      noLow: Boolean(brewery.noLow),
      beers: brewery.beers.map((beer, beerIndex) => ({
        id: id * 100 + beerIndex + 1,
        ...beer,
      })),
    };
  });
}

function assignIds(breweries) {
  return breweries.map((brewery, breweryIndex) => {
    const id = brewery.id ?? breweryIndex + 1;
    return {
      ...brewery,
      id,
      beers: (brewery.beers ?? []).map((beer, beerIndex) => ({
        ...beer,
        id: beer.id ?? id * 100 + beerIndex + 1,
      })),
    };
  });
}

function inferSessions(breweries) {
  const used = new Set();
  for (const brewery of breweries) {
    for (const beer of brewery.beers ?? []) {
      if (beer.session) used.add(beer.session);
    }
  }
  if (used.size === 0) return [];
  return DEFAULT_SESSIONS.filter((session) => used.has(session.id));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const source = args.source || args._[0];
  if (!source) {
    console.error("Pass a CSV/JSON path as the last argument or --source <file>.");
    process.exit(1);
  }

  const abs = path.resolve(source);
  const raw = await readFile(abs, "utf8");
  const isJson = abs.endsWith(".json");

  let festival = {};
  let breweries;

  if (isJson) {
    const parsed = JSON.parse(raw);
    festival = parsed;
    breweries = assignIds(parsed.breweries ?? []);
  } else {
    breweries = breweriesFromCsv(raw);
  }

  if (!breweries.length) throw new Error("No breweries found in the source file.");

  const name = args.name || festival.name;
  if (!name) throw new Error("Missing festival name. Pass --name or include it in the JSON.");

  const date = args.date || festival.date;
  const slug = kebab(args.slug || festival.slug || `${name}-${date || "fest"}`);
  const sessions =
    festival.sessions ??
    (args["no-sessions"] ? [] : inferSessions(breweries));

  const output = {
    slug,
    name,
    edition: args.edition || festival.edition || (date ? String(date).slice(0, 4) : undefined),
    date,
    dateLabel: args["date-label"] || festival.dateLabel,
    venue: args.venue || festival.venue,
    hours: args.hours || festival.hours,
    tagline: args.tagline || festival.tagline,
    splashBody: args["splash-body"] || festival.splashBody,
    splashCta: args["splash-cta"] || festival.splashCta,
    sessions,
    breweries,
  };

  Object.keys(output).forEach((key) => {
    if (output[key] == null || output[key] === "") delete output[key];
  });

  const dest = path.join(OUT_DIR, `${slug}.json`);
  if (args["dry-run"]) {
    const beerCount = breweries.reduce((sum, brewery) => sum + brewery.beers.length, 0);
    console.log(`Would write ${dest}`);
    console.log(`${breweries.length} breweries, ${beerCount} beers, slug=${slug}`);
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(dest, `${JSON.stringify(output, null, 2)}\n`);
  const beerCount = breweries.reduce((sum, brewery) => sum + brewery.beers.length, 0);
  console.log(`Wrote ${dest}`);
  console.log(`${breweries.length} breweries, ${beerCount} beers.`);
  console.log("Restart the dev server if it is already running.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
