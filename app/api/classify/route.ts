import { NextRequest, NextResponse } from "next/server";

export interface ClassifyRequestBody {
  category: "recyclable" | "non-recyclable" | "unknown";
  wasteType: string;
  label: string;
  confidence: number;
  partition: "recyclable" | "non-recyclable";
  dustbinId?: string;
  timestamp?: string;
}

// In-memory log (resets on server restart).
// In production, replace with a Firebase / database write.
const classificationLog: Array<
  ClassifyRequestBody & { id: string; receivedAt: string }
> = [];

export async function POST(request: NextRequest) {
  try {
    const body: ClassifyRequestBody = await request.json();

    const { category, wasteType, label, confidence, partition } = body;

    if (
      !category ||
      !wasteType ||
      !label ||
      confidence === undefined ||
      !partition
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: category, wasteType, label, confidence, partition",
        },
        { status: 400 },
      );
    }

    if (!["recyclable", "non-recyclable", "unknown"].includes(category)) {
      return NextResponse.json(
        {
          error:
            "Invalid category. Must be recyclable, non-recyclable, or unknown.",
        },
        { status: 400 },
      );
    }

    if (confidence < 0 || confidence > 1) {
      return NextResponse.json(
        { error: "confidence must be a number between 0 and 1." },
        { status: 400 },
      );
    }

    const entry = {
      id: `clf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category,
      wasteType,
      label,
      confidence,
      partition,
      dustbinId: body.dustbinId ?? undefined,
      timestamp: body.timestamp ?? new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    };

    classificationLog.unshift(entry);

    // Keep the in-memory log bounded to the last 500 entries
    if (classificationLog.length > 500) {
      classificationLog.splice(500);
    }

    console.log(
      `[classify] ${entry.category.toUpperCase()} — ${entry.label} ` +
        `(${(entry.confidence * 100).toFixed(1)}%) → ${entry.partition} bin` +
        (entry.dustbinId ? ` [dustbin: ${entry.dustbinId}]` : ""),
    );

    return NextResponse.json({
      success: true,
      id: entry.id,
      message: `Classification logged: ${entry.label} → ${entry.partition}`,
      entry,
    });
  } catch (error) {
    console.error("Classification API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const dustbinId = searchParams.get("dustbinId");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 200) : 50;

    let results = [...classificationLog];

    if (category) {
      results = results.filter((e) => e.category === category);
    }

    if (dustbinId) {
      results = results.filter((e) => e.dustbinId === dustbinId);
    }

    results = results.slice(0, limit);

    const total = classificationLog.length;
    const recyclableCount = classificationLog.filter(
      (e) => e.category === "recyclable",
    ).length;
    const nonRecyclableCount = classificationLog.filter(
      (e) => e.category === "non-recyclable",
    ).length;
    const unknownCount = classificationLog.filter(
      (e) => e.category === "unknown",
    ).length;

    return NextResponse.json({
      success: true,
      total,
      returned: results.length,
      stats: {
        recyclable: recyclableCount,
        nonRecyclable: nonRecyclableCount,
        unknown: unknownCount,
        recyclablePercentage:
          total > 0 ? Math.round((recyclableCount / total) * 100) : 0,
        nonRecyclablePercentage:
          total > 0 ? Math.round((nonRecyclableCount / total) * 100) : 0,
      },
      results,
    });
  } catch (error) {
    console.error("Classification GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
