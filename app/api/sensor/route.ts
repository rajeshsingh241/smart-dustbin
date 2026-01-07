import { NextRequest, NextResponse } from 'next/server';
import { updateDustbinData } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dustbinId, fillLevel, apiKey } = body;

    if (apiKey !== process.env.SENSOR_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!dustbinId || typeof fillLevel !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await updateDustbinData(dustbinId, fillLevel);

    return NextResponse.json({ 
      success: true, 
      message: 'Dustbin data updated',
      dustbinId,
      fillLevel
    });

  } catch (error) {
    console.error('Sensor API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}