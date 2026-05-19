import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { todayIST } from "@/lib/utils";

const USER_ID = "demo-syed";

// Cheapest vision-capable Claude model — ~₹0.20 per meal photo. Honest accuracy: ±20-25%.
const MODEL_ID = "claude-haiku-4-5-20251001";

type Estimate = {
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: "high" | "medium" | "low";
  notes: string;
};

const SYSTEM_PROMPT = `You analyze food photographs and estimate nutritional content for Indian-halal cuisine.

Output ONLY a single JSON object matching this exact shape — no prose, no markdown fences:
{
  "name": "<short dish name, e.g. 'Chicken biryani + raita'>",
  "mealType": "breakfast" | "lunch" | "dinner" | "snack",
  "calories": <integer>,
  "proteinG": <number, 1 decimal>,
  "carbsG": <number, 1 decimal>,
  "fatG": <number, 1 decimal>,
  "confidence": "high" | "medium" | "low",
  "notes": "<one sentence: portion size assumption + any caveats>"
}

Guidance:
- Estimate based on a standard adult male portion unless clearly large/small in the image.
- For ambiguous dishes (e.g. mixed thali), break down the visible components.
- Be honest about confidence — fried/saucy dishes are harder to estimate than dry foods.
- mealType: infer from food (idli/dosa/eggs → breakfast; biryani/curry+rice → lunch/dinner; nuts/fruit/protein shake → snack).
- Calories should reflect what is VISIBLE on the plate, including likely hidden oil/ghee in Indian preparation.
- Never refuse. If totally unclear, return confidence "low" and best estimate.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "ANTHROPIC_API_KEY not configured. Add it in Vercel Settings → Environment Variables.",
      },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("photo") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, error: "No photo uploaded" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mediaType =
      file.type === "image/png" ? "image/png" :
      file.type === "image/webp" ? "image/webp" :
      file.type === "image/gif" ? "image/gif" :
      "image/jpeg";

    const anthropic = new Anthropic({ apiKey });
    const res = await anthropic.messages.create({
      model: MODEL_ID,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: "Analyze this meal photo. Return only the JSON object." },
          ],
        },
      ],
    });

    const textBlock = res.content.find((c) => c.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ ok: false, error: "Empty model response" }, { status: 500 });
    }
    const raw = textBlock.text.trim();
    // Try to extract JSON if model wrapped in fences anyway
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ ok: false, error: "Model did not return JSON", raw }, { status: 500 });
    }
    const estimate: Estimate = JSON.parse(jsonMatch[0]);

    // Save to MealLog
    const saved = await prisma.mealLog.create({
      data: {
        userId: USER_ID,
        date: todayIST(),
        mealType: estimate.mealType,
        name: estimate.name,
        calories: estimate.calories,
        proteinG: estimate.proteinG,
        carbsG: estimate.carbsG,
        fatG: estimate.fatG,
      },
    });

    return NextResponse.json({ ok: true, estimate, mealId: saved.id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
