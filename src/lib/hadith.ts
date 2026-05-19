import { prisma } from "@/lib/prisma";

/**
 * Pick a fresh, contextually-appropriate hadith on every page load.
 *
 * Time-of-day awareness (IST):
 *   04:00-06:30 → missed-fajr (Fajr window)
 *   06:30-12:00 → encouragement / virtues (morning, gentle)
 *   12:00-15:30 → on-time / virtues (Dhuhr window)
 *   15:30-18:00 → missed-asr (Asr window — deeds nullified warning)
 *   18:00-19:30 → on-time / congregation (Maghrib window)
 *   19:30-22:00 → missed-isha (Isha window)
 *   22:00-04:00 → neglect-salah (deep night reflection)
 *
 * Returns a single random hadith from the contextually-relevant category,
 * with a fallback chain so we always return something.
 */
export type HadithRecord = {
  id: string;
  arabic: string | null;
  english: string;
  reference: string;
  category: string;
  severity: number;
};

function categoriesForNow(): string[] {
  // Bangalore is UTC+5:30
  const nowUtcMs = Date.now();
  const istMs = nowUtcMs + 5.5 * 60 * 60 * 1000;
  const hour = new Date(istMs).getUTCHours() + new Date(istMs).getUTCMinutes() / 60;

  if (hour >= 4 && hour < 6.5) return ["missed-fajr", "missed-salah", "neglect-salah"];
  if (hour >= 6.5 && hour < 12) return ["encouragement", "virtues", "focus"];
  if (hour >= 12 && hour < 15.5) return ["on-time", "virtues", "congregation"];
  if (hour >= 15.5 && hour < 18) return ["missed-asr", "missed-salah", "on-time"];
  if (hour >= 18 && hour < 19.5) return ["on-time", "congregation", "virtues"];
  if (hour >= 19.5 && hour < 22) return ["missed-isha", "missed-salah", "neglect-salah"];
  return ["neglect-salah", "missed-salah", "repentance"];
}

/**
 * Random hadith using PostgreSQL ORDER BY RANDOM() — picks a fresh one
 * every single call. No caching, no sticky session — every page load is new.
 */
export async function randomHadith(opts?: { categories?: string[]; minSeverity?: number }): Promise<HadithRecord | null> {
  const cats = opts?.categories ?? categoriesForNow();
  const minSev = opts?.minSeverity ?? 1;

  // Try preferred categories first
  const inPreferred = await prisma.$queryRaw<HadithRecord[]>`
    SELECT id, arabic, english, reference, category, severity
    FROM "Hadith"
    WHERE category = ANY(${cats}::text[])
      AND severity >= ${minSev}
    ORDER BY RANDOM()
    LIMIT 1
  `;
  if (inPreferred.length > 0) return inPreferred[0];

  // Fallback: any hadith
  const anyOne = await prisma.$queryRaw<HadithRecord[]>`
    SELECT id, arabic, english, reference, category, severity
    FROM "Hadith"
    ORDER BY RANDOM()
    LIMIT 1
  `;
  return anyOne[0] ?? null;
}

/**
 * Strongest possible warning — for use after a confirmed missed prayer.
 * Always severity 4-5, always neglect/missed categories.
 */
export async function strongestHadith(): Promise<HadithRecord | null> {
  const res = await prisma.$queryRaw<HadithRecord[]>`
    SELECT id, arabic, english, reference, category, severity
    FROM "Hadith"
    WHERE severity >= 4
      AND category IN ('neglect-salah', 'missed-salah', 'missed-fajr', 'missed-asr', 'missed-isha')
    ORDER BY RANDOM()
    LIMIT 1
  `;
  return res[0] ?? null;
}
