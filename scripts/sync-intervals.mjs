#!/usr/bin/env node
/**
 * Build-time telemetry sync from intervals.icu. Runs as `prebuild` and writes
 * src/data/telemetry.json.
 *
 * intervals.icu is the single source for all four cards, including FTP — which
 * the Strava API never exposed and which used to be maintained by hand.
 *
 * This never runs in the browser: the API key must not ship to the client, so
 * the numbers are baked into the HTML at build time.
 *
 * Resilience is the point of the error handling. A missing key, a revoked key
 * or an intervals.icu outage must not fail a deploy — on any failure we keep the
 * committed telemetry.json and exit 0.
 *
 * Required env (Vercel project settings, or a local .env):
 *   INTERVALS_ATHLETE_ID   e.g. i123456 (Settings → your athlete id)
 *   INTERVALS_API_KEY      Settings → Developer → API key
 *
 * Probe mode — run this once locally after setting the key:
 *   INTERVALS_PROBE=1 node scripts/sync-intervals.mjs
 * It prints the field names the API actually returned and writes nothing.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DATA = new URL('../src/data/', import.meta.url);
const TELEMETRY = new URL('telemetry.json', DATA);
const HISTORY = new URL('history.json', DATA);
const MANUAL = new URL('manual.json', DATA);

const API = 'https://intervals.icu/api/v1';
const PROBE = process.env.INTERVALS_PROBE === '1';

const log = (...a) => console.log('[intervals]', ...a);
const warn = (...a) => console.warn('[intervals]', ...a);

/** Activity types that count as riding. Everything else is ignored. */
const RIDE_TYPES = new Set([
  'Ride',
  'VirtualRide',
  'GravelRide',
  'MountainBikeRide',
  'EBikeRide',
  'Handcycle',
  'Velomobile',
]);

async function readJson(url, fallback = {}) {
  try {
    return JSON.parse(await readFile(url, 'utf8'));
  } catch {
    return fallback;
  }
}

function groupThousands(n) {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function pctDelta(current, previous, suffix) {
  if (!previous) return 'first full year';
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}% ${suffix}`;
}

function absDelta(current, previous, unit, suffix) {
  if (!previous) return 'first full year';
  const diff = Math.round(current - previous);
  return `${diff >= 0 ? '+' : ''}${diff} ${unit} ${suffix}`;
}

/**
 * intervals.icu largely mirrors Strava's activity field names, but not
 * everywhere and not forever. Rather than hard-coding one guess, take the first
 * candidate that is actually a number — and in probe mode, say which one won.
 */
function pick(obj, candidates, label) {
  for (const key of candidates) {
    const value = obj?.[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      if (PROBE) log(`  ${label}: using "${key}" = ${value}`);
      return value;
    }
  }
  if (PROBE) log(`  ${label}: NONE of ${candidates.join(', ')} matched`);
  return 0;
}

async function api(path, key) {
  // intervals.icu uses HTTP Basic with the literal username "API_KEY".
  const auth = Buffer.from(`API_KEY:${key}`).toString('base64');
  const res = await fetch(`${API}${path}`, {
    headers: { authorization: `Basic ${auth}`, accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`GET ${path} → ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
  return res.json();
}

async function fetchRideTotals({ athleteId, key, year }) {
  const activities = await api(
    `/athlete/${athleteId}/activities?oldest=${year}-01-01&newest=${year}-12-31`,
    key,
  );

  if (!Array.isArray(activities)) throw new Error('activities response was not an array');

  if (PROBE && activities[0]) {
    log(`sample activity has keys: ${Object.keys(activities[0]).sort().join(', ')}`);
  }

  const rides = activities.filter((a) => RIDE_TYPES.has(a.type));
  log(`${activities.length} activities in ${year}, ${rides.length} of them rides`);

  const totals = { distanceKm: 0, movingHours: 0, elevationM: 0 };

  for (const ride of rides) {
    totals.distanceKm += pick(ride, ['distance', 'icu_distance'], 'distance') / 1000;
    totals.movingHours += pick(ride, ['moving_time', 'icu_moving_time'], 'moving_time') / 3600;
    totals.elevationM += pick(ride, ['total_elevation_gain', 'icu_elevation_gain'], 'elevation');
  }

  return totals;
}

async function fetchFtp({ athleteId, key }) {
  const athlete = await api(`/athlete/${athleteId}`, key);

  if (PROBE) {
    log(`athlete has keys: ${Object.keys(athlete ?? {}).sort().join(', ')}`);
  }

  // FTP lives on the athlete for some accounts and in per-sport settings for
  // others, so check both before giving up.
  const direct = pick(athlete, ['icu_ftp', 'ftp', 'currentFtp'], 'ftp');
  if (direct) return direct;

  const settings = Array.isArray(athlete?.sportSettings) ? athlete.sportSettings : [];
  const ride = settings.find((s) => (s.types ?? []).some((t) => RIDE_TYPES.has(t))) ?? settings[0];

  return pick(ride, ['ftp', 'icu_ftp'], 'sportSettings.ftp');
}

async function main() {
  const athleteId = process.env.INTERVALS_ATHLETE_ID;
  const key = process.env.INTERVALS_API_KEY;

  if (!athleteId || !key) {
    log('credentials not set — keeping the committed telemetry.json');
    return;
  }

  const year = new Date().getUTCFullYear();
  const totals = await fetchRideTotals({ athleteId, key, year });

  // FTP is a nice-to-have: if only that call fails, still publish the rest.
  let ftp = 0;
  try {
    ftp = await fetchFtp({ athleteId, key });
  } catch (error) {
    warn('could not read FTP, falling back to manual.json —', error.message);
  }

  if (PROBE) {
    log('probe complete — nothing written');
    log(JSON.stringify({ totals, ftp }, null, 2));
    return;
  }

  const history = await readJson(HISTORY);
  const manual = await readJson(MANUAL, {});
  const previous = history[String(year - 1)] ?? null;
  const ftpValue = ftp || manual.ftp;

  const cards = [
    {
      label: `Distance ${year}`,
      value: groupThousands(totals.distanceKm),
      unit: 'km',
      delta: pctDelta(totals.distanceKm, previous?.distanceKm, `vs ${year - 1}`),
    },
    {
      label: 'Time in saddle',
      value: groupThousands(totals.movingHours),
      unit: 'h',
      delta: absDelta(totals.movingHours, previous?.movingHours, 'h', `vs ${year - 1}`),
    },
    {
      label: 'Elevation',
      value: (totals.elevationM / 1000).toFixed(1),
      unit: 'k m',
      delta:
        previous?.elevationM && totals.elevationM > previous.elevationM
          ? 'best year yet'
          : pctDelta(totals.elevationM, previous?.elevationM, `vs ${year - 1}`),
    },
    {
      label: 'FTP',
      value: ftpValue ? String(Math.round(ftpValue)) : '—',
      unit: 'W',
      delta: manual.ftpDelta ?? '',
    },
  ];

  await writeFile(
    fileURLToPath(TELEMETRY),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), source: 'intervals.icu', cards },
      null,
      2,
    ) + '\n',
  );

  history[String(year)] = {
    distanceKm: Math.round(totals.distanceKm),
    movingHours: Math.round(totals.movingHours),
    elevationM: Math.round(totals.elevationM),
  };
  await writeFile(fileURLToPath(HISTORY), JSON.stringify(history, null, 2) + '\n');

  log(`synced ${year}: ${cards[0].value} km · ${cards[1].value} h · FTP ${cards[3].value} W`);
}

try {
  await main();
} catch (error) {
  warn('sync failed, keeping the committed telemetry.json —', error.message);
}
