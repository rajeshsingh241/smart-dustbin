import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const PROMPT = `You are a waste classification expert AI. Analyze the image provided and classify the waste item shown.

Respond with ONLY a valid JSON object — no markdown, no code fences, no explanation outside the JSON.

Format:
{
  "category": "recyclable" | "non-recyclable" | "unknown",
  "wasteType": "plastic" | "glass" | "metal" | "paper" | "cardboard" | "e-waste" | "organic" | "general-waste" | "unknown",
  "label": "Specific name of the item, e.g. Plastic Water Bottle, Banana Peel, Crumpled Newspaper",
  "confidence": <number 0.0 to 1.0>,
  "description": "One sentence describing the item and the reason for its category.",
  "disposalTip": "One specific, actionable disposal instruction.",
  "partition": "recyclable" | "non-recyclable"
}

Classification Rules (follow strictly):
1. RECYCLABLE items (partition = "recyclable"):
   - Plastic bottles, caps, containers, packaging -> wasteType: "plastic"
   - Glass bottles, jars, broken glass -> wasteType: "glass"
   - Metal cans, aluminium foil, tins -> wasteType: "metal"
   - Clean/dry paper, newspapers, magazines, books -> wasteType: "paper"
   - Cardboard boxes, cartons, pizza boxes (clean) -> wasteType: "cardboard"
   - Electronics, phones, batteries, cables, circuit boards -> wasteType: "e-waste"

2. NON-RECYCLABLE items (partition = "non-recyclable"):
   - Food scraps, fruit peels, vegetable waste -> wasteType: "organic"
   - Food-soiled packaging, greasy pizza boxes -> wasteType: "general-waste"
   - Tissues, napkins, toilet paper -> wasteType: "general-waste"
   - Diapers, sanitary items -> wasteType: "general-waste"
   - Styrofoam / polystyrene -> wasteType: "general-waste"
   - Ceramic, porcelain, broken crockery -> wasteType: "general-waste"
   - Rubber gloves, balloons -> wasteType: "general-waste"

3. UNKNOWN:
   - If no waste item is clearly visible, return category: "unknown", confidence: 0.1
   - If the item is ambiguous, return category: "unknown"

Common Indian waste items guide:
- Chai / tea cup (paper) -> recyclable, paper
- Chai / tea cup (plastic / thermocol) -> non-recyclable, general-waste
- Plastic carry bag -> recyclable, plastic
- Newspaper / pamphlet -> recyclable, paper
- Coconut shell -> non-recyclable, organic
- Steel utensil -> recyclable, metal
- Old mobile phone -> recyclable, e-waste
- Banana peel, fruit peels -> non-recyclable, organic
- Cardboard box -> recyclable, cardboard`;

// Gemini models to try in order (stops at first success)
const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
];

// Parse a JSON classification object from raw AI text
function parseClassification(rawText: string): Record<string, unknown> | null {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

// Apply defaults and normalise fields
function normalise(obj: Record<string, unknown>): Record<string, unknown> {
  const defaults: Record<string, unknown> = {
    category: "unknown",
    wasteType: "unknown",
    label: "Unknown Item",
    confidence: 0.5,
    description: "Could not determine the waste type from the image.",
    disposalTip: "When in doubt, place in the general waste bin.",
    partition: "non-recyclable",
  };
  for (const [key, val] of Object.entries(defaults)) {
    if (obj[key] === undefined || obj[key] === null) obj[key] = val;
  }
  obj.confidence = Math.min(1, Math.max(0, Number(obj.confidence) || 0.5));
  obj.partition = obj.category === "recyclable" ? "recyclable" : "non-recyclable";
  return obj;
}

// Returns true if the error should trigger a try-next-model retry
function isRetryableError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes("404") ||
    lower.includes("429") ||
    lower.includes("not found") ||
    lower.includes("not supported") ||
    lower.includes("does not exist") ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("resource_exhausted") ||
    lower.includes("limit: 0")
  );
}

// ── Gemini provider ───────────────────────────────────────────────────────────
async function tryGemini(
  apiKey: string,
  imageBase64: string,
  mimeType: string
): Promise<Record<string, unknown> | null> {
  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`[classify-image] Gemini trying: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent([
        PROMPT,
        { inlineData: { data: imageBase64, mimeType } },
      ]);

      const rawText = result.response.text().trim();
      const classification = parseClassification(rawText);

      if (classification) {
        console.log(`[classify-image] Gemini success: ${modelName}`);
        return normalise(classification);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[classify-image] Gemini ${modelName} failed: ${msg.slice(0, 120)}`);
      if (!isRetryableError(msg)) break; // non-retryable — stop chain
    }
  }

  return null;
}

// ── Groq provider (LLaMA Vision, OpenAI-compatible API, no extra package) ────
async function tryGroq(
  apiKey: string,
  imageBase64: string,
  mimeType: string
): Promise<Record<string, unknown> | null> {
  const GROQ_MODELS = [
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "llama-3.2-90b-vision-preview",
    "llama-3.2-11b-vision-preview",
  ];

  for (const modelName of GROQ_MODELS) {
    try {
      console.log(`[classify-image] Groq trying: ${modelName}`);

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: PROMPT },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${imageBase64}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 600,
            temperature: 0.1,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn(
          `[classify-image] Groq ${modelName} HTTP ${response.status}: ${errText.slice(0, 120)}`
        );
        if (response.status === 429 || response.status === 404 || response.status === 400) {
          continue; // try next model
        }
        break; // other error — stop chain
      }

      const data = await response.json();
      const rawText: string =
        data?.choices?.[0]?.message?.content?.trim() ?? "";

      const classification = parseClassification(rawText);
      if (classification) {
        console.log(`[classify-image] Groq success: ${modelName}`);
        return normalise(classification);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[classify-image] Groq ${modelName} error: ${msg.slice(0, 120)}`);
    }
  }

  return null;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!geminiKey && !groqKey) {
      return NextResponse.json(
        {
          error:
            "No AI API key configured. Add GEMINI_API_KEY or GROQ_API_KEY to .env.local",
        },
        { status: 500 }
      );
    }

    let classification: Record<string, unknown> | null = null;

    // 1️⃣ Try Gemini first
    if (geminiKey) {
      classification = await tryGemini(geminiKey, imageBase64, mimeType);
    }

    // 2️⃣ Fall back to Groq
    if (!classification && groqKey) {
      console.log("[classify-image] Falling back to Groq...");
      classification = await tryGroq(groqKey, imageBase64, mimeType);
    }

    if (!classification) {
      return NextResponse.json(
        {
          error:
            "All AI providers failed. Check your API keys and quota limits.",
          hint: "Get a free Groq key at https://console.groq.com — very generous free tier.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, classification });
  } catch (error) {
    console.error("[classify-image] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Classification failed",
        details:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
