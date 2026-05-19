import { prisma } from "@/lib/prisma";
import { todayIST } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const USER_ID = "demo-syed";

async function logSleep(formData: FormData) {
  "use server";
  const bed = new Date(formData.get("bedTime") as string);
  const wake = new Date(formData.get("wakeTime") as string);
  const quality = parseInt((formData.get("quality") as string) || "3", 10);
  const hours = +(((wake.getTime() - bed.getTime()) / 1000 / 3600).toFixed(2));
  await prisma.sleepLog.upsert({
    where: { userId_date: { userId: USER_ID, date: todayIST() } },
    create: { userId: USER_ID, date: todayIST(), bedTime: bed, wakeTime: wake, hours, quality },
    update: { bedTime: bed, wakeTime: wake, hours, quality },
  });
  revalidatePath("/sleep");
  revalidatePath("/");
}

export default async function SleepPage() {
  const history = await prisma.sleepLog.findMany({
    where: { userId: USER_ID },
    orderBy: { date: "desc" },
    take: 14,
  });
  const avg = history.length ? +(history.reduce((a, h) => a + h.hours, 0) / history.length).toFixed(1) : 0;

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Sleep</h1>
      <p className="mt-1 text-sm text-white/60">
        Aim 7-8 h. Below 6 h spikes cortisol → fat loss stalls + lower focus.
      </p>

      <div className="mt-4 rounded-2xl bg-white/5 p-4">
        <p className="text-xs uppercase text-white/40">14-day average</p>
        <p className="mt-1 text-3xl font-bold">{avg} h</p>
      </div>

      <form action={logSleep} className="mt-6 space-y-3">
        <label className="block">
          <span className="text-sm text-white/60">Bedtime</span>
          <input type="datetime-local" name="bedTime" required className="mt-1 w-full rounded-xl bg-white/5 px-4 py-3 text-lg outline-none focus:bg-white/10" />
        </label>
        <label className="block">
          <span className="text-sm text-white/60">Wake time</span>
          <input type="datetime-local" name="wakeTime" required className="mt-1 w-full rounded-xl bg-white/5 px-4 py-3 text-lg outline-none focus:bg-white/10" />
        </label>
        <label className="block">
          <span className="text-sm text-white/60">Quality (1-5)</span>
          <input type="number" name="quality" min={1} max={5} defaultValue={3} className="mt-1 w-full rounded-xl bg-white/5 px-4 py-3 text-lg outline-none focus:bg-white/10" />
        </label>
        <button type="submit" className="w-full rounded-xl bg-emerald-600 py-3 font-medium">Save sleep</button>
      </form>

      <h2 className="mt-8 mb-2 text-sm uppercase text-white/40">Recent</h2>
      <ul className="space-y-1 text-sm">
        {history.map((h) => (
          <li key={h.id} className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
            <span>{h.date.toDateString()}</span>
            <span className="font-medium">{h.hours} h · Q{h.quality}/5</span>
          </li>
        ))}
        {history.length === 0 && <li className="text-white/40">No entries yet.</li>}
      </ul>
    </main>
  );
}
