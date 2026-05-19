import { prisma } from "@/lib/prisma";
import { todayIST } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const USER_ID = "demo-syed";

async function logWeight(formData: FormData) {
  "use server";
  const weightKg = parseFloat(formData.get("weightKg") as string);
  const waistCm = formData.get("waistCm") ? parseFloat(formData.get("waistCm") as string) : null;
  if (!weightKg) return;
  await prisma.weightLog.upsert({
    where: { userId_date: { userId: USER_ID, date: todayIST() } },
    create: { userId: USER_ID, date: todayIST(), weightKg, waistCm: waistCm ?? undefined },
    update: { weightKg, waistCm: waistCm ?? undefined },
  });
  revalidatePath("/weight");
  revalidatePath("/");
}

export default async function WeightPage() {
  const history = await prisma.weightLog.findMany({
    where: { userId: USER_ID },
    orderBy: { date: "desc" },
    take: 30,
  });
  const latest = history[0];
  const start = 101;
  const target = 80;
  const lost = latest ? +(start - latest.weightKg).toFixed(1) : 0;
  const remaining = latest ? +(latest.weightKg - target).toFixed(1) : 21;
  const progressPct = latest ? Math.min(100, Math.max(0, ((start - latest.weightKg) / (start - target)) * 100)) : 0;

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Body & Weight</h1>

      <div className="mt-4 rounded-2xl bg-white/5 p-4">
        <p className="text-xs uppercase text-white/40">Current → Target</p>
        <p className="mt-1 text-3xl font-bold">{latest?.weightKg ?? start} kg → {target} kg</p>
        <div className="mt-3 h-2 w-full rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-white/60">
          <span>Lost: {lost} kg</span>
          <span>To go: {remaining} kg</span>
        </div>
      </div>

      <form action={logWeight} className="mt-6 space-y-3">
        <label className="block">
          <span className="text-sm text-white/60">Today&apos;s weight (kg)</span>
          <input
            type="number" step="0.1" name="weightKg" required
            className="mt-1 w-full rounded-xl bg-white/5 px-4 py-3 text-lg outline-none focus:bg-white/10"
            placeholder="e.g. 100.4"
          />
        </label>
        <label className="block">
          <span className="text-sm text-white/60">Waist (cm) — optional</span>
          <input
            type="number" step="0.1" name="waistCm"
            className="mt-1 w-full rounded-xl bg-white/5 px-4 py-3 text-lg outline-none focus:bg-white/10"
            placeholder="e.g. 105"
          />
        </label>
        <button type="submit" className="w-full rounded-xl bg-emerald-600 py-3 font-medium">
          Save today&apos;s weight
        </button>
      </form>

      <h2 className="mt-8 mb-2 text-sm uppercase text-white/40">Last 30 days</h2>
      <ul className="space-y-1 text-sm">
        {history.map((h) => (
          <li key={h.id} className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
            <span>{h.date.toDateString()}</span>
            <span className="font-medium">{h.weightKg} kg{h.waistCm ? ` · waist ${h.waistCm}` : ""}</span>
          </li>
        ))}
        {history.length === 0 && <li className="text-white/40">No entries yet. Log your first weight above.</li>}
      </ul>
    </main>
  );
}
