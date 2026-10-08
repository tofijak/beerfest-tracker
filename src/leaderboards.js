import { styleCategory } from "./utils";

export const DEFAULT_PREFS = { entity: "person", board: "drinks-desc", minRatings: 1 };

export const ENTITIES = [
  ["person", "People"],
  ["beer", "Beers"],
  ["brewery", "Breweries"],
  ["style", "Styles"],
];

export const BOARDS = [
  ["drinks-desc", "Most drinks"],
  ["avg-desc", "Highest average"],
  ["avg-asc", "Lowest average"],
  ["drinks-asc", "Least drinks"],
  ["ratings-desc", "Most ratings"],
  ["stars-desc", "Most stars"],
];

export const MIN_CHOICES = [
  [1, "1+"],
  [3, "3+"],
  [5, "5+"],
];

const ENTITY_IDS = ENTITIES.map(([id]) => id);
const BOARD_IDS = BOARDS.map(([id]) => id);

const COPY = {
  person: {
    "drinks-desc": "Who has checked in the most beers.",
    "drinks-asc": "Fewest beers checked in, among people who have started.",
    "avg-desc": "Highest average of the ratings each person gave.",
    "avg-asc": "Lowest average of the ratings each person gave.",
    "ratings-desc": "Who has rated the most beers.",
    "stars-desc": "Who has starred the most beers.",
  },
  beer: {
    "drinks-desc": "Beers the most people have checked in.",
    "drinks-asc": "Beers the fewest people have checked in, among beers someone has tried.",
    "avg-desc": "Highest average rating from everyone who scored the beer.",
    "avg-asc": "Lowest average rating from everyone who scored the beer.",
    "ratings-desc": "Beers the most people have rated.",
    "stars-desc": "Beers the most people have starred.",
  },
  brewery: {
    "drinks-desc": "Breweries with the most beers checked in.",
    "drinks-asc": "Breweries with the fewest beers checked in, among ones someone has tried.",
    "avg-desc": "Highest average of every rating on that brewery's beers.",
    "avg-asc": "Lowest average of every rating on that brewery's beers.",
    "ratings-desc": "Breweries with the most ratings.",
    "stars-desc": "Breweries with the most stars.",
  },
  style: {
    "drinks-desc": "Styles with the most beers checked in.",
    "drinks-asc": "Styles with the fewest beers checked in, among ones someone has tried.",
    "avg-desc": "Highest average of every rating in that style.",
    "avg-asc": "Lowest average of every rating in that style.",
    "ratings-desc": "Styles with the most ratings.",
    "stars-desc": "Styles with the most stars.",
  },
};

export function normalizePrefs(value) {
  const raw = value && typeof value === "object" ? value : {};
  return {
    entity: ENTITY_IDS.includes(raw.entity) ? raw.entity : DEFAULT_PREFS.entity,
    board: BOARD_IDS.includes(raw.board) ? raw.board : DEFAULT_PREFS.board,
    minRatings: MIN_CHOICES.some(([min]) => min === raw.minRatings) ? raw.minRatings : DEFAULT_PREFS.minRatings,
  };
}

export function describeBoard(entity, board, minRatings) {
  const sentence = COPY[entity]?.[board] ?? "";
  if (board.startsWith("avg") && minRatings > 1) return `${sentence} At least ${minRatings} ratings.`;
  return sentence;
}

export function emptyMessage(empty, query = "") {
  if (empty === "no-match") return `Nothing matches “${String(query).trim()}”.`;
  if (empty === "floor") return "Nobody has that many ratings yet. Lower the minimum.";
  if (empty === "no-ratings") return "Nobody has rated a beer yet.";
  if (empty === "no-stars") return "Nobody has starred a beer yet.";
  return "Nobody has checked a beer in yet.";
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function averageOf(sum, count) {
  if (!count) return null;
  const value = round2(sum / count);
  return Number.isFinite(value) ? value : null;
}

function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`;
}

function compareNames(a, b) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function emptyAgg() {
  return {
    drinks: 0,
    drinkers: new Set(),
    ratingSum: 0,
    ratingCount: 0,
    stars: 0,
    stargazers: new Set(),
  };
}

function bump(map, key) {
  let agg = map.get(key);
  if (!agg) {
    agg = emptyAgg();
    map.set(key, agg);
  }
  return agg;
}

function buildCatalog(festival) {
  const beers = new Map();
  const breweries = new Map();
  const styles = new Map();

  for (const brewery of festival?.breweries ?? []) {
    const breweryKey = brewery?.id == null ? String(brewery?.name ?? "") : String(brewery.id);
    if (!breweries.has(breweryKey)) {
      breweries.set(breweryKey, { key: breweryKey, brewery, beerIds: [] });
    }
    for (const beer of brewery?.beers ?? []) {
      const id = String(beer.id);
      if (beers.has(id)) continue;
      const style = styleCategory(beer);
      const entry = { id, beer, brewery, breweryKey, style };
      beers.set(id, entry);
      breweries.get(breweryKey).beerIds.push(id);
      if (!styles.has(style)) styles.set(style, { key: style, name: style, beerIds: [] });
      styles.get(style).beerIds.push(id);
    }
  }

  return { beers, breweries, styles };
}

function ratingValue(value) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number) || number <= 0 || number > 5) return null;
  return round2(number);
}

function summarizePeople(people, beers) {
  const records = [];
  const seen = new Set();

  for (const person of people ?? []) {
    if (!person || typeof person.id !== "string" || person.id === "" || seen.has(person.id)) continue;
    seen.add(person.id);

    const drinkIds = new Set();
    const ratings = {};
    const starIds = new Set();
    let ratingSum = 0;

    for (const id of person.drunkBeerIds ?? []) {
      const key = String(id);
      if (beers.has(key)) drinkIds.add(key);
    }
    for (const [id, value] of Object.entries(person.ratings ?? {})) {
      if (!beers.has(id)) continue;
      const rating = ratingValue(value);
      if (rating == null) continue;
      ratings[id] = rating;
      ratingSum += rating;
      drinkIds.add(id);
    }
    for (const id of person.favoriteBeerIds ?? []) {
      const key = String(id);
      if (beers.has(key)) starIds.add(key);
    }

    const ratingCount = Object.keys(ratings).length;
    records.push({
      id: person.id,
      name: String(person.name || "Anonymous"),
      drinkIds,
      ratings,
      starIds,
      agg: {
        drinks: drinkIds.size,
        drinkers: new Set([person.id]),
        ratingSum,
        ratingCount,
        stars: starIds.size,
        stargazers: starIds.size ? new Set([person.id]) : new Set(),
      },
    });
  }

  return records;
}

function addCrewAggregates(records, beers) {
  const beerAggs = new Map();
  const breweryAggs = new Map();
  const styleAggs = new Map();

  const touch = (entry) => ({
    beer: bump(beerAggs, entry.id),
    brewery: bump(breweryAggs, entry.breweryKey),
    style: bump(styleAggs, entry.style),
  });

  for (const person of records) {
    for (const id of person.drinkIds) {
      const entry = beers.get(id);
      if (!entry) continue;
      for (const agg of Object.values(touch(entry))) {
        agg.drinks += 1;
        agg.drinkers.add(person.id);
      }
    }
    for (const [id, rating] of Object.entries(person.ratings)) {
      const entry = beers.get(id);
      if (!entry) continue;
      for (const agg of Object.values(touch(entry))) {
        agg.ratingSum += rating;
        agg.ratingCount += 1;
      }
    }
    for (const id of person.starIds) {
      const entry = beers.get(id);
      if (!entry) continue;
      for (const agg of Object.values(touch(entry))) {
        agg.stars += 1;
        agg.stargazers.add(person.id);
      }
    }
  }

  return { beerAggs, breweryAggs, styleAggs };
}

function qualifies(agg, board, minRatings) {
  if (!agg) return false;
  if (board.startsWith("drinks")) return agg.drinks > 0;
  if (board.startsWith("avg")) return agg.ratingCount >= minRatings;
  if (board === "ratings-desc") return agg.ratingCount > 0;
  return agg.stars > 0;
}

function rejection(agg, board, minRatings) {
  if (board.startsWith("avg") && agg && agg.ratingCount > 0 && agg.ratingCount < minRatings) return "floor";
  return "activity";
}

function scoreOf(agg, board) {
  if (board.startsWith("drinks")) return agg.drinks;
  if (board.startsWith("avg")) return averageOf(agg.ratingSum, agg.ratingCount);
  if (board === "ratings-desc") return agg.ratingCount;
  return agg.stars;
}

function unitFor(board, score) {
  if (board.startsWith("drinks")) return score === 1 ? "drink" : "drinks";
  if (board.startsWith("avg")) return "avg";
  if (board === "ratings-desc") return score === 1 ? "rating" : "ratings";
  return score === 1 ? "star" : "stars";
}

function scoreText(board, score) {
  if (score == null) return "–";
  if (board.startsWith("avg")) return score.toFixed(2);
  return score.toLocaleString("en-US");
}

function displayStats(agg, board) {
  return {
    drinks: agg.drinks,
    ratings: agg.ratingCount,
    average: averageOf(agg.ratingSum, agg.ratingCount),
    stars: agg.stars,
    people: board === "stars-desc" ? agg.stargazers.size : agg.drinkers.size,
  };
}

function describeStats(entity, board, stats) {
  const avgBit = stats.average == null ? null : `${stats.average.toFixed(2)} avg`;
  if (board.startsWith("drinks")) {
    if (entity === "person" || entity === "beer") return avgBit ?? "No ratings yet";
    return plural(stats.people, "person", "people");
  }
  if (board.startsWith("avg")) {
    return `${plural(stats.ratings, "rating", "ratings")} · ${plural(stats.drinks, "drink", "drinks")}`;
  }
  if (board === "ratings-desc") {
    if (entity === "person") return avgBit ?? "No average yet";
    return plural(stats.drinks, "drink", "drinks");
  }
  if (entity === "person") return plural(stats.drinks, "drink", "drinks");
  return plural(stats.people, "person", "people");
}

function beerLine(entry) {
  const bits = [entry.brewery?.name];
  if (entry.beer?.style) bits.push(entry.beer.style);
  if (typeof entry.beer?.abv === "number") bits.push(`${entry.beer.abv}%`);
  return bits.filter(Boolean).join(" · ");
}

function youLabel(self, ids) {
  if (!self) return null;
  const ratings = [];
  let tried = false;
  for (const id of ids) {
    if (self.drinkIds.has(id)) tried = true;
    if (typeof self.ratings[id] === "number") ratings.push(self.ratings[id]);
  }
  if (ratings.length) {
    const average = averageOf(
      ratings.reduce((sum, rating) => sum + rating, 0),
      ratings.length,
    );
    return average == null ? "Tried" : `You ${average.toFixed(2)}`;
  }
  return tried ? "Tried" : null;
}

function memberQualifies(agg, board) {
  if (!agg) return false;
  if (board.startsWith("drinks")) return agg.drinks > 0;
  if (board.startsWith("avg") || board === "ratings-desc") return agg.ratingCount > 0;
  return agg.stars > 0;
}

function byScore(board) {
  const direction = board.endsWith("asc") ? 1 : -1;
  return (a, b) => {
    const aScore = a.sortScore;
    const bScore = b.sortScore;
    if (aScore == null && bScore == null) return compareNames(a.name, b.name);
    if (aScore == null) return 1;
    if (bScore == null) return -1;
    if (aScore !== bScore) return (aScore - bScore) * direction;
    return compareNames(a.name, b.name);
  };
}

function beerMember(entry, board, agg, rating) {
  const sortScore = board.startsWith("drinks")
    ? (rating ?? agg?.drinks ?? null)
    : board === "stars-desc"
      ? (agg?.stars ?? rating ?? null)
      : (rating ?? (agg ? scoreOf(agg, board) : null));
  let text = "–";
  if (rating != null && (board.startsWith("avg") || board === "ratings-desc" || board.startsWith("drinks"))) {
    text = rating.toFixed(2);
  } else if (agg) {
    text = scoreText(board, scoreOf(agg, board));
  } else if (rating != null) {
    text = rating.toFixed(2);
  }
  if (board.startsWith("drinks") && rating == null && !agg) text = "Tried";
  if (board === "stars-desc" && rating == null && !agg) text = "Starred";
  return {
    key: entry.id,
    beerId: entry.beer.id,
    name: entry.beer.name,
    detail: entry.brewery?.name ?? "",
    scoreText: text,
    sortScore,
  };
}

function activityEmpty(board) {
  if (board.startsWith("avg") || board === "ratings-desc") return "no-ratings";
  if (board === "stars-desc") return "no-stars";
  return "no-drinks";
}

function finishRows(rows, board) {
  const direction = board.endsWith("asc") ? 1 : -1;
  rows.sort((a, b) => {
    if (a.score !== b.score) return (a.score - b.score) * direction;
    if (board.startsWith("avg") && a.sample !== b.sample) return b.sample - a.sample;
    return compareNames(a.name, b.name);
  });

  let lastScore = Number.NaN;
  let lastRank = 0;
  rows.forEach((row, index) => {
    if (row.score === lastScore) row.rank = lastRank;
    else {
      row.rank = index + 1;
      lastRank = row.rank;
      lastScore = row.score;
    }
  });

  const scores = rows.map((row) => row.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const span = max - min;
  const ascending = board.endsWith("asc");
  for (const row of rows) {
    if (!Number.isFinite(span) || span === 0) row.bar = 1;
    else row.bar = ascending ? (max - row.score) / span : (row.score - min) / span;
  }
  return rows;
}

function haystack(parts) {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

export function buildLeaderboard({ festival, people, entity, board, minRatings = 1, query = "", selfId = null }) {
  const catalog = buildCatalog(festival);
  const crew = summarizePeople(people, catalog.beers);
  const grouped = addCrewAggregates(crew, catalog.beers);
  const self = selfId ? crew.find((person) => person.id === selfId) ?? null : null;
  const needle = String(query ?? "").trim().toLowerCase();
  const safeEntity = ENTITY_IDS.includes(entity) ? entity : "person";
  const safeBoard = BOARD_IDS.includes(board) ? board : "drinks-desc";
  const minimum = MIN_CHOICES.some(([min]) => min === minRatings) ? minRatings : 1;

  const candidates = [];

  if (safeEntity === "person") {
    for (const person of crew) {
      const beerNames = [...person.drinkIds, ...person.starIds].map((id) => catalog.beers.get(id)?.beer?.name);
      candidates.push({
        key: `person:${person.id}`,
        name: person.name,
        kind: "person",
        agg: person.agg,
        search: haystack([person.name, ...beerNames]),
        detail: "",
        stand: null,
        style: null,
        beerId: null,
        isSelf: person.id === selfId,
        youLabel: null,
        members: personMembers(person, catalog, safeBoard),
      });
    }
  } else if (safeEntity === "beer") {
    for (const entry of catalog.beers.values()) {
      candidates.push({
        key: `beer:${entry.id}`,
        name: entry.beer.name,
        kind: "beer",
        agg: grouped.beerAggs.get(entry.id) ?? emptyAgg(),
        search: haystack([entry.beer.name, entry.brewery?.name, entry.beer.style, entry.style]),
        detail: beerLine(entry),
        stand: entry.brewery?.stand ?? null,
        style: entry.style,
        beerId: entry.beer.id,
        isSelf: false,
        youLabel: youLabel(self, [entry.id]),
        members: [],
      });
    }
  } else if (safeEntity === "brewery") {
    for (const group of catalog.breweries.values()) {
      const beerNames = group.beerIds.map((id) => catalog.beers.get(id)?.beer?.name);
      candidates.push({
        key: `brewery:${group.key}`,
        name: group.brewery?.name ?? "Brewery",
        kind: "brewery",
        agg: grouped.breweryAggs.get(group.key) ?? emptyAgg(),
        search: haystack([group.brewery?.name, group.brewery?.location, ...beerNames]),
        detail: [group.brewery?.location, plural(group.beerIds.length, "beer", "beers")].filter(Boolean).join(" · "),
        stand: group.brewery?.stand ?? null,
        style: null,
        beerId: null,
        isSelf: false,
        youLabel: youLabel(self, group.beerIds),
        members: groupMembers(group.beerIds, catalog, grouped.beerAggs, safeBoard, "brewery"),
      });
    }
  } else {
    for (const group of catalog.styles.values()) {
      const names = group.beerIds.flatMap((id) => {
        const entry = catalog.beers.get(id);
        return [entry?.beer?.name, entry?.brewery?.name];
      });
      candidates.push({
        key: `style:${group.key}`,
        name: group.name,
        kind: "style",
        agg: grouped.styleAggs.get(group.key) ?? emptyAgg(),
        search: haystack([group.name, ...names]),
        detail: plural(group.beerIds.length, "beer", "beers"),
        stand: null,
        style: group.name,
        beerId: null,
        isSelf: false,
        youLabel: youLabel(self, group.beerIds),
        members: groupMembers(group.beerIds, catalog, grouped.beerAggs, safeBoard, "style"),
      });
    }
  }

  const rows = [];
  let floor = 0;
  let matched = 0;

  for (const candidate of candidates) {
    if (needle && !candidate.search.includes(needle)) continue;
    matched += 1;
    if (!qualifies(candidate.agg, safeBoard, minimum)) {
      if (rejection(candidate.agg, safeBoard, minimum) === "floor") floor += 1;
      continue;
    }
    const score = scoreOf(candidate.agg, safeBoard);
    if (score == null) continue;
    const stats = displayStats(candidate.agg, safeBoard);
    rows.push({
      key: candidate.key,
      name: candidate.name,
      kind: candidate.kind,
      score,
      scoreText: scoreText(safeBoard, score),
      unit: unitFor(safeBoard, score),
      note: describeStats(safeEntity, safeBoard, stats),
      detail: candidate.detail,
      tone: safeBoard.startsWith("avg") ? "rating" : safeBoard === "stars-desc" ? "stars" : safeBoard === "ratings-desc" ? "ratings" : "drinks",
      sample: safeBoard.startsWith("avg") ? candidate.agg.ratingCount : 0,
      isSelf: candidate.isSelf,
      youLabel: candidate.youLabel,
      beerId: candidate.beerId,
      stand: candidate.stand,
      style: candidate.style,
      members: candidate.members,
      bar: 0,
      rank: 0,
    });
  }

  let empty = null;
  if (rows.length === 0) {
    if (needle && matched === 0) empty = "no-match";
    else if (floor > 0) empty = "floor";
    else if (needle) empty = "no-match";
    else empty = activityEmpty(safeBoard);
  } else {
    finishRows(rows, safeBoard);
  }

  return {
    rows,
    empty,
    total: rows.length,
    rosterCount: crew.length,
    activeCount: crew.filter((person) => person.agg.drinks > 0).length,
    self: self
      ? {
          name: self.name,
          drinkCount: self.agg.drinks,
          ratingCount: self.agg.ratingCount,
          average: averageOf(self.agg.ratingSum, self.agg.ratingCount),
          starCount: self.agg.stars,
        }
      : null,
  };
}

function personMembers(person, catalog, board) {
  const ids =
    board.startsWith("drinks")
      ? [...person.drinkIds]
      : board === "stars-desc"
        ? [...person.starIds]
        : Object.keys(person.ratings);
  const members = ids
    .map((id) => catalog.beers.get(id))
    .filter(Boolean)
    .map((entry) => beerMember(entry, board, null, person.ratings[entry.id] ?? null));
  if (board.startsWith("drinks")) {
    members.sort((a, b) => {
      if (a.sortScore == null && b.sortScore == null) return compareNames(a.name, b.name);
      if (a.sortScore == null) return 1;
      if (b.sortScore == null) return -1;
      if (a.sortScore !== b.sortScore) return b.sortScore - a.sortScore;
      return compareNames(a.name, b.name);
    });
  } else {
    members.sort(byScore(board));
  }
  return members.map(stripSort);
}

function groupMembers(beerIds, catalog, beerAggs, board, entity) {
  const members = [];
  for (const id of beerIds) {
    const agg = beerAggs.get(id);
    if (!memberQualifies(agg, board)) continue;
    const entry = catalog.beers.get(id);
    if (!entry) continue;
    const member = beerMember(entry, board, agg, null);
    if (entity === "style") member.detail = entry.brewery?.name ?? "";
    else member.detail = [entry.beer.style, typeof entry.beer.abv === "number" ? `${entry.beer.abv}%` : null].filter(Boolean).join(" · ");
    member.sortScore = scoreOf(agg, board);
    members.push(member);
  }
  members.sort(byScore(board));
  return members.map(stripSort);
}

function stripSort(member) {
  return {
    key: member.key,
    beerId: member.beerId,
    name: member.name,
    detail: member.detail,
    scoreText: member.scoreText,
  };
}
