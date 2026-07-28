#!/usr/bin/env node
/**
 * Build-time Strava sync. Runs as `prebuild` and writes src/data/telemetry.json.
 *
 * This never runs in the browser: the refresh token must not ship to the client,
 * so the numbers are baked into the HTML at build time and nothing is fetched
 * at runtime.
 *
 * Resilience is the whole point of the error handling here — a Strava outage,
 * a revoked token or a missing secret must not fail a deploy. On any failure we
 * keep the committed telemetry.json (which is why it is committed) and exit 0.
 *
 * Required env (Vercel project settings, or a local .env):
 *   STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN, STRAVA_ATHLETE_ID
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DATA = new URL('../src/data/', import.meta.url);
const TELEMETRY = new URL('telemetry.json', DATA);
const HISTORY = new URL('history.json', DATA);
const MANUAL = new URL('manual.json', DATA);

const log = (...args) => console.log('[strava]', ...args);
const warn = (...args) => console.warn('[strava]', ...args);

async function readJson(url, fallback = {}) {
  try {
    return JSON.parse(await readFile(url, 'utf8'));
  } catch {
    return fallback;
  }
}

/** "6842" -> "6 842", matching the design's space-grouped thousands. */
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

async function refreshAccessToken({ clientId, clientSecret, refreshToken }) {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error(`token refresh failed: ${res.status} ${await res.text()}`);
  const json = await res.json();

  // Strava rotates the refresh token. Log the new one so it can be updated in
  // Vercel; the build still succeeds with the old one until it is.
  if (json.refresh_token && json.refresh_token !== refreshToken) {
    log('refresh token rotated — update STRAVA_REFRESH_TOKEN to:', json.refresh_token);
  }

  return json.access_token;
}

async function fetchYtdRideTotals({ athleteId, accessToken }) {
  const res = await fetch(`https://www.strava.com/api/v3/athletes/${athleteId}/stats`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`stats failed: ${res.status} ${await res.text()}`);

  const { ytd_ride_totals: ytd } = await res.json();
  if (!ytd) throw new Error('response had no ytd_ride_totals');

  return {
    distanceKm: ytd.distance / 1000,
    movingHours: ytd.moving_time / 3600,
    elevationM: ytd.elevation_gain,
  };
}

async function main() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  const athleteId = process.env.STRAVA_ATHLETE_ID;

  if (!clientId || !clientSecret || !refreshToken || !athleteId) {
    log('credentials not set — keeping the committed telemetry.json');
    return;
  }

  const accessToken = await refreshAccessToken({ clientId, clientSecret, refreshToken });
  const totals = await fetchYtdRideTotals({ athleteId, accessToken });

  const year = new Date().getUTCFullYear();
  const history = await readJson(HISTORY);
  const manual = await readJson(MANUAL, {});
  const previous = history[String(year - 1)] ?? null;

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
      // Strava does not expose FTP; it is maintained by hand in manual.json.
      label: 'FTP',
      value: String(manual.ftp ?? '—'),
      unit: 'W',
      delta: manual.ftpDelta ?? '',
    },
  ];

  await writeFile(
    fileURLToPath(TELEMETRY),
    JSON.stringify({ generatedAt: new Date().toISOString(), source: 'strava', cards }, null, 2) +
      '\n',
  );

  // Keep the running year up to date so next year's deltas have a baseline.
  history[String(year)] = {
    distanceKm: Math.round(totals.distanceKm),
    movingHours: Math.round(totals.movingHours),
    elevationM: Math.round(totals.elevationM),
  };
  await writeFile(fileURLToPath(HISTORY), JSON.stringify(history, null, 2) + '\n');

  log(`synced ${year}: ${cards[0].value} km · ${cards[1].value} h`);
}

try {
  await main();
} catch (error) {
  warn('sync failed, keeping the committed telemetry.json —', error.message);
}
