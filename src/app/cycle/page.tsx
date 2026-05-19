import { prisma } from "@/lib/prisma";
import { todayIST } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const USER_ID = "demo-syed";

async function logCycle(formData: FormData) {
  "use server";
  const distanceKm = parseFloat(formData.get("distanceKm") as string);
  const durationMin = parseInt(formData.get("durationMin") as string, 10);
  if (!distanceKm || !durationMin) return;
  const avgSpeedKmh = +((distanceKm / (durationMin / 60))).toFixed(1);
  // Rough calorie estimate: cycling at ~15 km/h, ~100kg body = ~7-8 kcal/min
  const calories = Math.round(durationMin * 7.5);
  await prisma.cycleLog.create({
    data: { userId: USER_ID, date: todayIST(), distanceKm, durationMin, avgSpeedKmh, calories },
  });
  revalidatePath("/cycle");
  revalidatePath("/");
}

export default async function CyclePage() {
  const history = await prisma.cycleLog.findMany({
    where: { userId: USER_ID },
    orderBy: { date: "desc" },
    take: 14,
  });
  const totalKm = +history.reduce((a, h) => a + h.distanceKm, 0).toFixed(1);
  const totalCal = history.reduce((a, h) => a + (h.calories ?? 0), 0);

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Cycling</h1>
      <p className="mt-1 text-sm text-white/60">
        Ramp plan: Week 1-2 → 10 km · Week 3-4 → 20 km · Week 5-6 → 30 km · Week 7+ → 40 km
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs uppercase text-white/40">14-day km</p>
          <p className="mt-1 text-3xl font-bold">{totalKm}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs uppercase text-white/40">14-day kcal</p>
          <p className="mt-1 text-3xl font-bold">{totalCal}</p>
        </div>
      </div>

      <form action={logCycle} className="mt-6 space-y-3">
        <label className="block">
          <span className="text-sm text-white/60">Distance (km)</span>
          <input type="number" step="0.1" name="distanceKm" required className="mt-1 w-full rounded-xl bg-white/5 px-4 py-3 text-lg outline-none focus:bg-white/10" />
        </label>
        <label className="block">
          <span className="text-sm text-white/60">Duration (min)</span>
          <input type="number" name="durationMin" required className="mt-1 w-full rounded-xl bg-white/5 px-4 py-3 text-lg outline-none focus:bg-white/10" />
        </label>
        <button type="submit" className="w-full rounded-xl bg-emerald-600 py-3 font-medium">Log ride</button>
      </form>

      <h2 className="mt-8 mb-2 text-sm uppercase text-white/40">Recent rides</h2>
      <ul className="space-y-1 text-sm">
        {history.map((h) => (
          <li key={h.id} className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
            <span>{h.date.toDateString()}</span>
            <span className="font-medium">{h.distanceKm} km · {h.durationMin}m · {h.calories} kcal</span>
          </li>
        ))}
        {history.length === 0 && <li className="text-white/40">No rides yet.</li>}
      </ul>
    </main>
  );
}
