import { NextResponse } from 'next/server';

const NODEMCU_URL = 'http://192.168.4.1';
const FETCH_TIMEOUT_MS = 2000;

// Match your physical bin height (cm when completely empty)
const BIN_HEIGHT_CM = 30.0;
// Sensor blind spot minimum distance
const MIN_DIST_CM = 2.0;

interface NodeMCUData {
  fillLevel: number;
  distance: number;
  status: string;
  timestamp: string;
}

/**
 * Calculate fill level from distance.
 * distance = BIN_HEIGHT_CM  →  0%   (empty)
 * distance = MIN_DIST_CM    →  100% (full)
 */
function calcFill(distanceCm: number): number {
  if (distanceCm <= 0) return 0;
  const fill =
    ((BIN_HEIGHT_CM - distanceCm) / (BIN_HEIGHT_CM - MIN_DIST_CM)) * 100;
  return Math.min(100, Math.max(0, Math.round(fill)));
}

function deriveStatus(fill: number): string {
  if (fill >= 80) return 'critical';
  if (fill >= 50) return 'warning';
  return 'normal';
}

/**
 * Extract distance in cm from HTML or JSON response.
 * Tries several patterns to be robust across different NodeMCU sketches.
 */
function parseDistance(text: string): number | null {
  // JSON: { "distance": 12.3 } or { "dist": 12.3 }
  try {
    const json = JSON.parse(text);
    const d = json.distance ?? json.dist ?? json.Distance ?? null;
    if (typeof d === 'number' && d > 0) return d;
  } catch {
    // not JSON — continue to HTML parsing
  }

  // HTML patterns (order matters — most specific first)
  const patterns = [
    // "Distance</p><p>12.34 cm"  or  "Distance: 12.34 cm"
    /distance[^0-9]{0,30}(\d+\.?\d*)\s*cm/i,
    // bare "12.34 cm" anywhere
    /(\d+\.?\d*)\s*cm/i,
  ];

  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const val = parseFloat(m[1]);
      if (val > 0 && val <= 500) return val; // sanity range
    }
  }

  return null;
}

export async function GET() {
  try {
    const endpoints = ['/', '/data', '/json', '/status', '/sensor'];
    let body = '';
    let fetched = false;

    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const res = await fetch(`${NODEMCU_URL}${endpoint}`, {
          signal: controller.signal,
          cache: 'no-store',
          headers: { Accept: 'text/html,application/json,*/*' },
        });

        clearTimeout(timer);

        if (res.ok) {
          body = await res.text();
          fetched = true;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!fetched || !body) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Cannot reach NodeMCU at 192.168.4.1. Make sure your laptop is connected to the SMART-DUSTBIN WiFi.',
        },
        { status: 503 }
      );
    }

    // ── Extract distance ────────────────────────────────────────────────────
    const distance = parseDistance(body);

    if (distance === null) {
      return NextResponse.json(
        {
          success: false,
          error:
            'NodeMCU responded but distance could not be parsed. Check the NodeMCU sketch output.',
          raw: body.slice(0, 400),
        },
        { status: 422 }
      );
    }

    // ── Calculate fill level from distance (reliable) ───────────────────────
    const fillLevel = calcFill(distance);
    const status = deriveStatus(fillLevel);

    const result: NodeMCUData = {
      fillLevel,
      distance,
      status,
      timestamp: new Date().toISOString(),
    };

    console.log(
      `[nodemcu] distance=${distance.toFixed(1)}cm → fillLevel=${fillLevel}% (${status})`
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[nodemcu] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while fetching NodeMCU data.' },
      { status: 500 }
    );
  }
}
