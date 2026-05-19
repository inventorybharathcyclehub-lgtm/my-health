import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrayerTimes } from "@/lib/aladhan";
import { todayIST, PRAYERS } from "@/lib/utils";

const USER_ID = "demo-syed";

// Convert "HH:MM (timezone)" like "05:14 (IST)" into minutes since midnight IST
function parsePrayerTimeToMinutes(s: string): number {
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (!m) return -1;
  return parseInt(m[1]) * 60 + parseInt(m[2]);
}

// Pick the current prayer window based on IST now-minutes
function currentPrayer(times: Awaited<ReturnType<typeof getPrayerTimes>>, nowMin: number): typeof PRAYERS[number] | null {
  const fajr = parsePrayerTimeToMinutes(times.Fajr);
  const dhuhr = parsePrayerTimeToMinutes(times.Dhuhr);
  const asr = parsePrayerTimeToMinutes(times.Asr);
  const maghrib = parsePrayerTimeToMinutes(times.Maghrib);
  const isha = parsePrayerTimeToMinutes(times.Isha);

  // Each prayer's "window" is from its start until next prayer's start.
  // Fajr: from fajr until sunrise (~30-40 min after fajr).
  // For simplicity we use: fajr active until dhuhr-1, dhuhr until asr, etc.
  if (nowMin >= fajr && nowMin < dhuhr - 30) return "fajr";
  if (nowMin >= dhuhr && nowMin < asr) return "dhuhr";
  if (nowMin >= asr && nowMin < maghrib) return "asr";
  if (nowMin >= maghrib && nowMin < isha) return "maghrib";
  if (nowMin >= isha || nowMin < fajr) return "isha";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const locationId = body.locationId as string;

    const loc = await prisma.location.findUnique({ where: { id: locationId } });
    if (!loc || loc.userId !== USER_ID) {
      return NextResponse.json({ ok: false, error: "Location not found" }, { status: 404 });
    }

    // Get today's prayer times for Bangalore (Shafi)
    const times = await getPrayerTimes({ city: "Bangalore", country: "India", school: 0 });

    // Compute "now" in IST minutes-since-midnight
    const nowUtcMs = Date.now();
    const ist = new Date(nowUtcMs + 5.5 * 60 * 60 * 1000);
    const nowMin = ist.getUTCHours() * 60 + ist.getUTCMinutes();

    const prayer = currentPrayer(times, nowMin);
    if (!prayer) {
      return NextResponse.json({ ok: false, error: "Not in any prayer window right now" }, { status: 400 });
    }

    const date = todayIST();
    await prisma.prayerLog.upsert({
      where: { userId_date: { userId: USER_ID, date } },
      create: { userId: USER_ID, date, [prayer]: true },
      update: { [prayer]: true },
    });

    return NextResponse.json({ ok: true, prayer, location: loc.name });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
