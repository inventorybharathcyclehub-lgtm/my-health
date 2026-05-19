import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { todayIST, PRAYERS } from "@/lib/utils";
import { getPrayerTimes } from "@/lib/aladhan";

export const dynamic = "force-dynamic";

// For V1 we hardcode a single user (you). Add NextAuth Google in next iteration.
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
  const [prayer, weight, sleep, cycle, totalMissed] = await Promise.all([
    prisma.prayerLog.findUnique({ where: { userId_date: { userId: DEMO_USER_ID, date: today } } }),
    prisma.weightLog.findFirst({ where: { userId: DEMO_USER_ID }, orderBy: { date: "desc" } }),
    prisma.sleepLog.findFirst({ where: { userId: DEMO_USER_ID }, orderBy: { date: "desc" } }),
    prisma.cycleLog.findFirst({ where: { userId: DEMO_USER_ID }, orderBy: { date: "desc" } }),
    prisma.prayerLog.findMany({ where: { userId: DEMO_USER_ID } }),
  ]);

  let times: Awaited<ReturnType<typeof getPrayerTimes>> | null = null;
  try {
    times = await getPrayerTimes({ city: "Bangalore", country: "India", school: 0 });
  } catch {}

  const missedTotal = totalMissed.reduce((acc, p) => {
    return acc + PRAYERS.filter((k) => !p[k]).length;
  }, 0);

  const doneToday = prayer ? PRAYERS.filter((p) => prayer[p]).length : 0;

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Assalamu alaikum, Syed</h1>
        <p className="text-sm text-white/60">Today — {today.toDateString()} · Bangalore</p>
      </header>

      <section className="mb-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 p-4">
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
          ⚠ Total prayers missed (qada debt): <strong>{missedTotal}</strong>
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Card href="/weight" label="Weight" value={weight ? `${weight.weightKg} kg` : "Log"} sub="target 80 kg" />
        <Card href="/sleep" label="Sleep" value={sleep ? `${sleep.hours.toFixed(1)} h` : "Log"} sub="aim 7-8 h" />
        <Card href="/cycle" label="Cycling" value={cycle ? `${cycle.distanceKm} km` : "Log"} sub="ramp to 40 km" />
        <Card href="/insights" label="Insights" value="View" sub="weekly summary" />
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
