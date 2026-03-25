import { NextRequest, NextResponse } from "next/server";
import { sendMunicipalAlert } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dustbinId, location, fillLevel, latitude, longitude } = body;

    if (!dustbinId || !location || !fillLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await sendMunicipalAlert({
      dustbinId,
      location,
      fillLevel,
      latitude,
      longitude,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Alert sent successfully",
      });
    } else {
      return NextResponse.json(
        {
          error: "Failed to send alert",
          details: result.error,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Alert API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
