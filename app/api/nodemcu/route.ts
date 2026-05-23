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
  ir: string;
  moisture: number;
  gas: number;
  pi1: string;
  pi2: string;
  ultrasonic1: number;
  ultrasonic2: number;
  ultrasonic3: number;
  ultrasonic4: number;
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

function parseDashboardData(text: string) {
  const data: any = {};
  
  // Remove HTML tags for easier parsing if they exist, but keeping them mostly intact is fine.
  // The regex will look for "Label: Value"
  
  const irMatch = text.match(/IR:\s*(.+?)(?:<|\n|\r|$)/i);
  data.ir = irMatch ? irMatch[1].trim() : 'Unknown';
  
  const moistureMatch = text.match(/Moisture:\s*(\d+)/i);
  data.moisture = moistureMatch ? parseInt(moistureMatch[1], 10) : 0;
  
  const gasMatch = text.match(/Gas:\s*(\d+)/i);
  data.gas = gasMatch ? parseInt(gasMatch[1], 10) : 0;
  
  const pi1Match = text.match(/PI1:\s*(LOW|HIGH)/i);
  data.pi1 = pi1Match ? pi1Match[1].trim() : 'Unknown';

  const pi2Match = text.match(/PI2:\s*(LOW|HIGH)/i);
  data.pi2 = pi2Match ? pi2Match[1].trim() : 'Unknown';
  
  const u1Match = text.match(/Ultrasonic 1:\s*(\d+\.?\d*)\s*cm/i);
  data.ultrasonic1 = u1Match ? parseFloat(u1Match[1]) : 0;
  
  const u2Match = text.match(/Ultrasonic 2:\s*(\d+\.?\d*)\s*cm/i);
  data.ultrasonic2 = u2Match ? parseFloat(u2Match[1]) : 0;
  
  const u3Match = text.match(/Ultrasonic 3:\s*(\d+\.?\d*)\s*cm/i);
  data.ultrasonic3 = u3Match ? parseFloat(u3Match[1]) : 0;
  
  const u4Match = text.match(/Ultrasonic 4:\s*(\d+\.?\d*)\s*cm/i);
  data.ultrasonic4 = u4Match ? parseFloat(u4Match[1]) : 0;
  
  return data;
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

    // ── Extract Data ────────────────────────────────────────────────────
    const dashboardData = parseDashboardData(body);
    
    // Use ultrasonic1 as the main distance for the primary bin status
    const distance = dashboardData.ultrasonic1;
    
    // ── Calculate fill level from distance (reliable) ───────────────────────
    const fillLevel = calcFill(distance);
    const status = deriveStatus(fillLevel);

    const result: NodeMCUData = {
      ...dashboardData,
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
