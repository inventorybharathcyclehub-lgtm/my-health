import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PRAYERS, todayIST } from "@/lib/utils";
import { randomHadith } from "@/lib/hadith";
import { HadithCard } from "@/components/HadithCard";

export const dynamic = "force-dynamic";

const USER_ID = "demo-syed";

export default async function InsightsPage() {
  const today = todayIST();
  const weekAgo = new Date(today);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

  const [prayers7, weights7, sleeps7, cycles7, allPrayers, latestWeight, hadith] = await Promise.all([
    prisma.prayerLog.findMany({ where: { userId: USER_ID, date: { gte: weekAgo } } }),
    prisma.weightLog.findMany({ where: { userId: USER_ID, date: { gte: weekAgo } }, orderBy: { date: "asc" } }),
    prisma.sleepLog.findMany({ where: { userId: USER_ID, date: { gte: weekAgo } } }),
    prisma.cycleLog.findMany({ where: { userId: USER_ID, date: { gte: weekAgo } } }),
    prisma.prayerLog.findMany({ where: { userId: USER_ID } }),
    prisma.weightLog.findFirst({ where: { userId: USER_ID }, orderBy: { date: "desc" } }),
    randomHadith(),
  ]);

  // 7-day salah completion
  const prayed7 = prayers7.reduce((acc, p) => acc + PRAYERS.filter((k) => p[k]).length, 0);
  const possible7 = 7 * 5;
  const salahPct = Math.round((prayed7 / possible7) * 100);

  // Fajr completion specifically — the hardest test
  const fajr7 = prayers7.filter((p) => p.fajr).length;

  // Weight delta
  const weightStart = 101;
  const weightNow = latestWeight?.weightKg ?? weightStart;
  const totalLost = +(weightStart - weightNow).toFixed(1);
  const weeklyDelta = weights7.length >= 2
    ? +(weights7[0].weightKg - weights7[weights7.length - 1].weightKg).toFixed(1)
    : 0;

  // Sleep + cycling
  const sleepAvg = sleeps7.length ? +(sleeps7.reduce((a, s) => a + s.hours, 0) / sleeps7.length).toFixed(1) : 0;
  const cycleKm = +cycles7.reduce((a, c) => a + c.distanceKm, 0).toFixed(1);

  // Lifetime qada debt
  const lifetimeMissed = allPrayers.reduce((acc, p) => acc + PRAYERS.filter((k) => !p[k]).length, 0);

  // Honest verdicts (the user asked for no sugar-coating)
  const verdicts: { label: string; tone: "good" | "warn" | "bad"; msg: string }[] = [];

  if (salahPct >= 80) verdicts.push({ label: "Salah", tone: "good", msg: `${salahPct}% of prayers this week. Keep going.` });
  else if (salahPct >= 50) verdicts.push({ label: "Salah", tone: "warn", msg: `${salahPct}% of prayers. The Prophet ﷺ said this is your first reckoning.` });
  else verdicts.push({ label: "Salah", tone: "bad", msg: `Only ${salahPct}% of prayers. ${possible7 - prayed7} missed. Each one is qada debt.` });

  if (fajr7 >= 6) verdicts.push({ label: "Fajr", tone: "good", msg: `${fajr7}/7 Fajr. You are under Allah's protection.` });
  else if (fajr7 >= 4) verdicts.push({ label: "Fajr", tone: "warn", msg: `${fajr7}/7 Fajr. The hypocrites' hardest prayer — push for 7/7.` });
  else verdicts.push({ label: "Fajr", tone: "bad", msg: `Only ${fajr7}/7 Fajr. This is THE test prayer. Fix this first.` });

  if (weeklyDelta >= 1) verdicts.push({ label: "Weight", tone: "good", msg: `Down ${weeklyDelta} kg this week. On track for 80 kg.` });
  else if (weeklyDelta >= 0) verdicts.push({ label: "Weight", tone: "warn", msg: `Flat this week. Tighten food + cycling.` });
  else verdicts.push({ label: "Weight", tone: "bad", msg: `Up ${Math.abs(weeklyDelta)} kg. Calorie surplus — log meals.` });

  if (sleepAvg >= 7) verdicts.push({ label: "Sleep", tone: "good", msg: `${sleepAvg} h average. Cortisol controlled.` });
  else if (sleepAvg >= 6) verdicts.push({ label: "Sleep", tone: "warn", msg: `${sleepAvg} h — fat loss slower below 7h.` });
  else if (sleepAvg > 0) verdicts.push({ label: "Sleep", tone: "bad", msg: `${sleepAvg} h. High cortisol → blocks fat loss + kills focus.` });

  if (cycleKm >= 100) verdicts.push({ label: "Cycling", tone: "good", msg: `${cycleKm} km this week. Excellent.` });
  else if (cycleKm >= 40) verdicts.push({ label: "Cycling", tone: "warn", msg: `${cycleKm} km. Keep ramping.` });
  else verdicts.push({ label: "Cycling", tone: "bad", msg: `${cycleKm} km. Need 70+ km/week for fat loss at this weight.` });

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <header className="mb-6">
        <Link href="/" className="text-xs text-white/60">← Home</Link>
        <h1 className="mt-2 text-2xl font-semibold">7-Day Insights</h1>
        <p className="text-sm text-white/60">Honest weekly review — what's working, what isn't</p>
      </header>

      <HadithCard hadith={hadith} />

      <section className="mb-4 grid grid-cols-2 gap-3">
        <Stat label="Salah" value={`${prayed7}/${possible7}`} sub={`${salahPct}%`} />
        <Stat label="Fajr" value={`${fajr7}/7`} sub="hardest test" />
        <Stat label="Weight" value={`${weightNow} kg`} sub={`${totalLost >= 0 ? "−" : "+"}${Math.abs(totalLost)} total`} />
        <Stat label="Sleep avg" value={`${sleepAvg} h`} sub="aim 7-8h" />
        <Stat label="Cycle 7d" value={`${cycleKm} km`} sub="ramp to 40/day" />
        <Stat label="Qada debt" value={`${lifetimeMissed}`} sub="lifetime missed" critical />
      </section>

      <h2 className="mt-6 mb-2 text-sm uppercase tracking-widest text-white/40">Verdicts</h2>
      <ul className="space-y-2">
        {verdicts.map((v) => (
          <li
            key={v.label}
            className={`rounded-xl border p-3 ${
              v.tone === "good"
                ? "border-emerald-900/40 bg-emerald-950/30"
                : v.tone === "warn"
                  ? "border-amber-900/40 bg-amber-950/20"
                  : "border-red-900/50 bg-red-950/30"
            }`}
          >
            <p className={`text-xs uppercase tracking-widest ${v.tone === "good" ? "text-emerald-300" : v.tone === "warn" ? "text-amber-300" : "text-red-300"}`}>
              {v.label}
            </p>
            <p className="mt-1 text-sm text-white/90">{v.msg}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-xl bg-white/5 p-4 text-xs text-white/60">
        <p className="font-medium text-white/80">How this works:</p>
        <p className="mt-1">
          The app reads your prayer logs, weight, sleep, and cycling entries from the last 7 days.
          A new hadith is shown on every page load — contextually picked based on the current prayer time.
          Use this page weekly to review honestly.
        </p>
      </div>
    </main>
  );
}

function Stat({ label, value, sub, critical }: { label: string; value: string; sub: string; critical?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${critical ? "bg-red-950/30 border border-red-900/40" : "bg-white/5"}`}>
      <p className={`text-xs uppercase tracking-widest ${critical ? "text-red-300" : "text-white/40"}`}>{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="text-xs text-white/40">{sub}</p>
    </div>
  );
}
