import { prisma } from "@/lib/prisma";
import { todayIST, PRAYERS, type PrayerName } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { randomHadith, strongestHadith } from "@/lib/hadith";
import { HadithCard } from "@/components/HadithCard";

export const dynamic = "force-dynamic";

const USER_ID = "demo-syed";

async function togglePrayer(formData: FormData) {
  "use server";
  const prayer = formData.get("prayer") as PrayerName;
  const date = todayIST();
  const existing = await prisma.prayerLog.findUnique({
    where: { userId_date: { userId: USER_ID, date } },
  });
  const next = !(existing?.[prayer] ?? false);
  await prisma.prayerLog.upsert({
    where: { userId_date: { userId: USER_ID, date } },
    create: { userId: USER_ID, date, [prayer]: next },
    update: { [prayer]: next },
  });
  revalidatePath("/salah");
  revalidatePath("/");
}

export default async function SalahPage() {
  const date = todayIST();
  const [log, allLogs, hadith] = await Promise.all([
    prisma.prayerLog.findUnique({ where: { userId_date: { userId: USER_ID, date } } }),
    prisma.prayerLog.findMany({ where: { userId: USER_ID } }),
    // If any prayer missed today → strongest warning. Otherwise time-aware hadith.
    (async () => {
      const todayLog = await prisma.prayerLog.findUnique({ where: { userId_date: { userId: USER_ID, date } } });
      const missedToday = !todayLog || PRAYERS.some((p) => !todayLog[p]);
      return missedToday ? strongestHadith() : randomHadith();
    })(),
  ]);

  const missedCount = allLogs.reduce((acc, p) => acc + PRAYERS.filter((k) => !p[k]).length, 0);

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Today&apos;s Salah</h1>
      <p className="mt-1 text-sm text-white/60">{date.toDateString()}</p>

      <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 p-4">
        <p className="text-xs uppercase tracking-widest text-red-300">Qada debt — prayers you have missed</p>
        <p className="mt-1 text-4xl font-bold text-red-200">{missedCount}</p>
        <p className="mt-1 text-xs text-red-300/80">Every miss adds to this. Make qada in sha Allah.</p>
      </div>

      <div className="mt-4">
        <HadithCard hadith={hadith} />
      </div>

      <div className="mt-6 space-y-2">
        {PRAYERS.map((p) => {
          const done = log?.[p] ?? false;
          return (
            <form key={p} action={togglePrayer}>
              <input type="hidden" name="prayer" value={p} />
              <button
                type="submit"
                className={`flex w-full items-center justify-between rounded-xl px-4 py-4 text-left transition ${
                  done ? "bg-emerald-700/30 border border-emerald-500/40" : "bg-white/5 border border-white/10"
                }`}
              >
                <span className="text-lg font-medium capitalize">{p}</span>
                <span className={`text-sm ${done ? "text-emerald-300" : "text-red-300"}`}>
                  {done ? "✓ Prayed" : "✗ Tap when prayed"}
                </span>
              </button>
            </form>
          );
        })}
      </div>
    </main>
  );
}
