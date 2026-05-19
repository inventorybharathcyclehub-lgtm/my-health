import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { todayIST, PRAYERS } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const USER_ID = "demo-syed";

// Manual items (user must tap to confirm) — auto-items computed below
const MANUAL_ITEMS = [
  { key: "water_3l", label: "3 L water", emoji: "💧" },
  { key: "quran_10min", label: "10 min Qur'an", emoji: "📖" },
  { key: "no_sugar", label: "No added sugar today", emoji: "🚫" },
  { key: "walk_10k", label: "Hit 10,000 steps", emoji: "🚶" },
  { key: "deep_work_2h", label: "2 hours of deep work", emoji: "🧠" },
  { key: "no_screens_after_10", label: "No screens after 10 PM", emoji: "🌙" },
];

async function toggleItem(formData: FormData) {
  "use server";
  const key = formData.get("key") as string;
  const date = todayIST();
  const existing = await prisma.checklistOverride.findUnique({
    where: { userId_date_key: { userId: USER_ID, date, key } },
  });
  const next = !(existing?.done ?? false);
  await prisma.checklistOverride.upsert({
    where: { userId_date_key: { userId: USER_ID, date, key } },
    create: { userId: USER_ID, date, key, done: next },
    update: { done: next },
  });
  revalidatePath("/checklist");
  revalidatePath("/");
}

export default async function ChecklistPage() {
  const today = todayIST();
  const [prayer, weight, sleep, cycle, mealsCount, overrides] = await Promise.all([
    prisma.prayerLog.findUnique({ where: { userId_date: { userId: USER_ID, date: today } } }),
    prisma.weightLog.findUnique({ where: { userId_date: { userId: USER_ID, date: today } } }),
    prisma.sleepLog.findUnique({ where: { userId_date: { userId: USER_ID, date: today } } }),
    prisma.cycleLog.count({ where: { userId: USER_ID, date: today } }),
    prisma.mealLog.count({ where: { userId: USER_ID, date: today } }),
    prisma.checklistOverride.findMany({ where: { userId: USER_ID, date: today } }),
  ]);

  const overrideMap = new Map(overrides.map((o) => [o.key, o.done]));

  // Computed (auto-ticked) items
  const computed = [
    { key: "auto_fajr", label: "Fajr prayed", emoji: "🕌", done: prayer?.fajr ?? false },
    { key: "auto_all5", label: "All 5 salah", emoji: "🕋", done: prayer ? PRAYERS.every((p) => prayer[p]) : false },
    { key: "auto_weight", label: "Weight logged", emoji: "⚖️", done: !!weight },
    { key: "auto_sleep", label: "Sleep logged (7+ hours)", emoji: "😴", done: !!sleep && sleep.hours >= 7 },
    { key: "auto_cycle", label: "Cycled today", emoji: "🚴", done: cycle > 0 },
    { key: "auto_meals", label: "Logged at least 3 meals", emoji: "🍽️", done: mealsCount >= 3 },
  ];

  // Manual items with current state
  const manual = MANUAL_ITEMS.map((m) => ({ ...m, done: overrideMap.get(m.key) ?? false }));

  const totalItems = computed.length + manual.length;
  const doneItems = computed.filter((c) => c.done).length + manual.filter((m) => m.done).length;
  const pct = Math.round((doneItems / totalItems) * 100);

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <header className="mb-4">
        <Link href="/" className="text-xs text-white/60">← Home</Link>
        <h1 className="mt-2 text-2xl font-semibold">Daily checklist</h1>
        <p className="text-sm text-white/60">{today.toDateString()}</p>
      </header>

      <section className="mb-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 p-4">
        <p className="text-xs uppercase tracking-widest text-emerald-300">Today&apos;s progress</p>
        <p className="mt-1 text-3xl font-bold">{doneItems}/{totalItems} <span className="text-base font-normal">({pct}%)</span></p>
        <div className="mt-3 h-2 w-full rounded-full bg-emerald-950">
          <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <h2 className="mb-2 text-xs uppercase tracking-widest text-white/40">
        Auto-tracked <span className="ml-1 text-white/30">(updates from your other logs)</span>
      </h2>
      <ul className="mb-6 space-y-2">
        {computed.map((c) => (
          <li key={c.key} className={`flex items-center gap-3 rounded-xl border p-3 ${c.done ? "border-emerald-700/40 bg-emerald-950/30" : "border-white/10 bg-white/5"}`}>
            <span className="text-xl">{c.emoji}</span>
            <span className="flex-1 text-sm">{c.label}</span>
            <span className={`text-sm ${c.done ? "text-emerald-300" : "text-white/40"}`}>{c.done ? "✓" : "—"}</span>
          </li>
        ))}
      </ul>

      <h2 className="mb-2 text-xs uppercase tracking-widest text-white/40">
        Tap to mark
      </h2>
      <ul className="space-y-2">
        {manual.map((m) => (
          <li key={m.key}>
            <form action={toggleItem}>
              <input type="hidden" name="key" value={m.key} />
              <button
                type="submit"
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition active:scale-[0.99] ${
                  m.done ? "border-emerald-700/40 bg-emerald-950/30" : "border-white/10 bg-white/5"
                }`}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="flex-1 text-sm">{m.label}</span>
                <span className={`text-sm ${m.done ? "text-emerald-300" : "text-white/40"}`}>{m.done ? "✓ Done" : "Tap"}</span>
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
