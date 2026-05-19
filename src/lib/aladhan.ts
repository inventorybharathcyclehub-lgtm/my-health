// Aladhan prayer times API wrapper.
// Docs: https://aladhan.com/prayer-times-api

export type PrayerTimes = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

// Method 2 = ISNA, school 0 = Shafi/standard, school 1 = Hanafi (Asr later)
export async function getPrayerTimes(opts: {
  city?: string;
  country?: string;
  date?: Date;
  school?: 0 | 1;
  method?: number;
}): Promise<PrayerTimes> {
  const city = opts.city ?? "Bangalore";
  const country = opts.country ?? "India";
  const d = opts.date ?? new Date();
  const dateStr = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  const school = opts.school ?? 0; // Shafi standard
  const method = opts.method ?? 2; // ISNA — change later if needed

  const url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}&school=${school}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Aladhan API error: ${res.status}`);
  const json = await res.json();
  return json.data.timings as PrayerTimes;
}
