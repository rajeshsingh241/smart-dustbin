import { NextRequest, NextResponse } from 'next/server';

// ── In-memory store (lives as long as the Next.js server process is running) ──
interface SensorReading {
  dustbinId: string;
  fillLevel: number;
  distance?: number;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;
}

// Module-level map — survives across requests in the same process
const sensorStore: Record<string, SensorReading> = {};

function deriveStatus(fillLevel: number): 'normal' | 'warning' | 'critical' {
  if (fillLevel >= 80) return 'critical';
  if (fillLevel >= 50) return 'warning';
  return 'normal';
}

// ── POST /api/sensor — NodeMCU sends data here ────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dustbinId, fillLevel, apiKey, distance } = body;

    // Auth check — SENSOR_API_KEY must match what is in .env.local
    if (process.env.SENSOR_API_KEY && apiKey !== process.env.SENSOR_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!dustbinId || typeof fillLevel !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: dustbinId (string) and fillLevel (number)' },
        { status: 400 }
      );
    }

    const clamped = Math.min(100, Math.max(0, Math.round(fillLevel)));
    const reading: SensorReading = {
      dustbinId,
      fillLevel: clamped,
      status: deriveStatus(clamped),
      lastUpdated: new Date().toISOString(),
      ...(typeof distance === 'number' ? { distance } : {}),
    };

    sensorStore[dustbinId] = reading;

    console.log(
      `[sensor] ${dustbinId} → ${clamped}% (${reading.status})` +
        (distance !== undefined ? ` | dist: ${distance.toFixed(1)} cm` : '')
    );

    // Best-effort Firebase update (silently skip if not configured)
    try {
      const { updateDustbinData } = await import('@/lib/firebase');
      await updateDustbinData(dustbinId, clamped);
    } catch {
      // Firebase not configured — that's fine, in-memory is the source of truth
    }

    return NextResponse.json({
      success: true,
      message: 'Sensor reading received',
      data: reading,
    });
  } catch (error) {
    console.error('[sensor] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── GET /api/sensor — Dashboard polls this every 3 s ─────────────────────────
export async function GET() {
  const sensors = { ...sensorStore };
  const count = Object.keys(sensors).length;

  return NextResponse.json({
    success: true,
    count,
    sensors,
    polledAt: new Date().toISOString(),
  });
}
