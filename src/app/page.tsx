import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { todayIST, PRAYERS, dailyCalorieTarget } from "@/lib/utils";
import { getPrayerTimes } from "@/lib/aladhan";
import { randomHadith } from "@/lib/hadith";
import { HadithCard } from "@/components/HadithCard";

export const dynamic = "force-dynamic";

const DEMO_USER_ID = "demo-syed";

async function ensureDemoUser() {
  await prisma.user.upsert({
    where: { email: "inventory.bharathcyclehub@gmail.com" },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: "inventory.bharathcyclehub@gmail.com",
      name: "Syed Ibrahim",
      startWeightKg: 101,
      targetWeightKg: 80,
      city: "Bangalore",
      madhhab: "standard",
      timezone: "Asia/Kolkata",
    },
  });
}

export default async function HomePage() {
  await ensureDemoUser();

  const today = todayIST();
  const [prayer, weight, sleep, cycle, totalMissed, hadith, mealsToday, overrides] = await Promise.all([
    prisma.prayerLog.findUnique({ where: { userId_date: { userId: DEMO_USER_ID, date: today } } }),
    prisma.weightLog.findFirst({ where: { userId: DEMO_USER_ID }, orderBy: { date: "desc" } }),
    prisma.sleepLog.findFirst({ where: { userId: DEMO_USER_ID }, orderBy: { date: "desc" } }),
    prisma.cycleLog.findMany({ where: { userId: DEMO_USER_ID, date: today } }),
    prisma.prayerLog.findMany({ where: { userId: DEMO_USER_ID } }),
    randomHadith(),
    prisma.mealLog.findMany({ where: { userId: DEMO_USER_ID, date: today } }),
    prisma.checklistOverride.findMany({ where: { userId: DEMO_USER_ID, date: today } }),
  ]);

  let times: Awaited<ReturnType<typeof getPrayerTimes>> | null = null;
  try {
    times = await getPrayerTimes({ city: "Bangalore", country: "India", school: 0 });
  } catch {}

  const missedTotal = totalMissed.reduce((acc, p) => acc + PRAYERS.filter((k) => !p[k]).length, 0);
  const doneToday = prayer ? PRAYERS.filter((p) => prayer[p]).length : 0;

  // Diet math
  const weightNow = weight?.weightKg ?? 101;
  const calTarget = dailyCalorieTarget(weightNow, 175, 30, 1.4);
  const calEaten = mealsToday.reduce((a, m) => a + m.calories, 0);
  const calLeft = calTarget - calEaten;

  // Cycling km today (sum if multiple rides)
  const kmToday = +cycle.reduce((a, c) => a + c.distanceKm, 0).toFixed(1);

  // Checklist progress (6 auto + 6 manual = 12 total)
  const autoDone =
    (prayer?.fajr ? 1 : 0) +
    (prayer && PRAYERS.every((p) => prayer[p]) ? 1 : 0) +
    (weight && weight.date.toDateString() === today.toDateString() ? 1 : 0) +
    (sleep && sleep.date.toDateString() === today.toDateString() && sleep.hours >= 7 ? 1 : 0) +
    (kmToday > 0 ? 1 : 0) +
    (mealsToday.length >= 3 ? 1 : 0);
  const manualDone = overrides.filter((o) => o.done).length;
  const checklistDone = autoDone + manualDone;
  const checklistPct = Math.round((checklistDone / 12) * 100);

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Assalamu alaikum, Syed</h1>
        <p className="text-sm text-white/60">Today — {today.toDateString()} · Bangalore</p>
      </header>

      <HadithCard hadith={hadith} />

      {/* SALAH */}
      <section className="mb-3 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-300">Today&apos;s Salah</p>
            <p className="mt-1 text-3xl font-bold">{doneToday}/5</p>
          </div>
          <Link href="/salah" className="rounded-full bg-emerald-700/40 px-4 py-2 text-sm font-medium">
            Open →
          </Link>
        </div>
        {times && (
          <div className="mt-3 grid grid-cols-5 gap-1 text-center text-[10px] text-emerald-200">
            <div><div>Fajr</div><div>{times.Fajr}</div></div>
            <div><div>Dhuhr</div><div>{times.Dhuhr}</div></div>
            <div><div>Asr</div><div>{times.Asr}</div></div>
            <div><div>Maghrib</div><div>{times.Maghrib}</div></div>
            <div><div>Isha</div><div>{times.Isha}</div></div>
          </div>
        )}
        <p className="mt-3 rounded-lg bg-red-950/40 px-3 py-2 text-xs text-red-200">
          ⚠ Qada debt: <strong>{missedTotal}</strong> prayers missed
        </p>
      </section>

      {/* DIET */}
      <section className="mb-3 rounded-2xl bg-gradient-to-br from-amber-900/40 to-stone-950 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-300">Today&apos;s diet</p>
            <p className="mt-1 text-3xl font-bold">{calEaten} <span className="text-sm font-normal text-amber-200">/ {calTarget} kcal</span></p>
          </div>
          <Link href="/diet" className="rounded-full bg-amber-700/40 px-4 py-2 text-sm font-medium">
            Open →
          </Link>
        </div>
        <p className={`mt-3 rounded-lg px-3 py-2 text-xs ${calLeft >= 0 ? "bg-emerald-950/40 text-emerald-200" : "bg-red-950/40 text-red-200"}`}>
          {calLeft >= 0 ? `${calLeft} kcal left in budget` : `${Math.abs(calLeft)} kcal over — cycle ${Math.round(Math.abs(calLeft) / 7.5)} extra min`}
        </p>
      </section>

      {/* CHECKLIST */}
      <section className="mb-3 rounded-2xl bg-gradient-to-br from-blue-900/40 to-stone-950 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-300">Productivity</p>
            <p className="mt-1 text-3xl font-bold">{checklistDone}/12 <span className="text-sm font-normal text-blue-200">({checklistPct}%)</span></p>
          </div>
          <Link href="/checklist" className="rounded-full bg-blue-700/40 px-4 py-2 text-sm font-medium">
            Open →
          </Link>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-blue-950/40">
          <div className="h-1.5 rounded-full bg-blue-400" style={{ width: `${checklistPct}%` }} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Card href="/weight" label="Weight" value={weight ? `${weight.weightKg} kg` : "Log"} sub="target 80 kg" />
        <Card href="/sleep" label="Sleep" value={sleep ? `${sleep.hours.toFixed(1)} h` : "Log"} sub="aim 7-8 h" />
        <Card href="/cycle" label="Cycling" value={kmToday ? `${kmToday} km` : "Log"} sub="ramp to 40 km" />
        <Card href="/insights" label="Insights" value="View" sub="weekly summary" />
        <Card href="/locations" label="Locations" value="Pin" sub="mosque, gym, home" />
        <Card href="/diet/photo" label="Snap meal" value="📸" sub="AI calorie est." />
      </div>
    </main>
  );
}

function Card({ href, label, value, sub }: { href: string; label: string; value: string; sub: string }) {
  return (
    <Link href={href} className="rounded-2xl bg-white/5 p-4 transition active:bg-white/10">
      <p className="text-xs uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="text-xs text-white/40">{sub}</p>
    </Link>
  );
}
