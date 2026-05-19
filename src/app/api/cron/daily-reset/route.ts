import { NextRequest, NextResponse } from "next/server";

// Runs at midnight IST (18:30 UTC). Placeholder — extend to email summaries, etc.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
}
