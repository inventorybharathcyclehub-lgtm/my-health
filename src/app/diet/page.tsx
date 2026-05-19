import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { todayIST, dailyCalorieTarget } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const USER_ID = "demo-syed";
const MEAL_ORDER = ["breakfast", "lunch", "snack", "dinner"] as const;

async function logMealFromPlan(formData: FormData) {
  "use server";
  const planId = formData.get("planId") as string;
  const plan = await prisma.dietPlan.findUnique({ where: { id: planId } });
  if (!plan) return;
  await prisma.mealLog.create({
    data: {
      userId: USER_ID,
      date: todayIST(),
      mealType: plan.mealType,
      name: plan.name,
      calories: plan.calories,
      proteinG: plan.proteinG,
      carbsG: plan.carbsG,
      fatG: plan.fatG,
    },
  });
  revalidatePath("/diet");
  revalidatePath("/");
}

async function deleteMeal(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.mealLog.delete({ where: { id } });
  revalidatePath("/diet");
  revalidatePath("/");
}

export default async function DietPage() {
  const today = todayIST();
  const [plans, mealsToday, latestWeight] = await Promise.all([
    prisma.dietPlan.findMany({ orderBy: [{ mealType: "asc" }, { sortOrder: "asc" }] }),
    prisma.mealLog.findMany({ where: { userId: USER_ID, date: today }, orderBy: { id: "asc" } }),
    prisma.weightLog.findFirst({ where: { userId: USER_ID }, orderBy: { date: "desc" } }),
  ]);

  const weightNow = latestWeight?.weightKg ?? 101;
  const calTarget = dailyCalorieTarget(weightNow, 175, 30, 1.4); // assumes 30y old, 175cm, light-active

  const totalCals = mealsToday.reduce((a, m) => a + m.calories, 0);
  const totalProtein = mealsToday.reduce((a, m) => a + (m.proteinG ?? 0), 0);
  const totalCarbs = mealsToday.reduce((a, m) => a + (m.carbsG ?? 0), 0);
  const totalFat = mealsToday.reduce((a, m) => a + (m.fatG ?? 0), 0);
  const remaining = calTarget - totalCals;
  const proteinTarget = Math.round(weightNow * 1.6); // 1.6 g/kg for cutting

  // Estimate cycling minutes needed to burn off any surplus
  const surplus = totalCals - calTarget;
  const cyclingMinutesToBalance = surplus > 0 ? Math.round(surplus / 7.5) : 0; // ~7.5 kcal/min for 100kg

  const byMeal: Record<string, typeof plans> = {};
  for (const p of plans) {
    if (!byMeal[p.mealType]) byMeal[p.mealType] = [];
    byMeal[p.mealType].push(p);
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <header className="mb-4">
        <Link href="/" className="text-xs text-white/60">← Home</Link>
        <h1 className="mt-2 text-2xl font-semibold">Diet plan — today</h1>
        <p className="text-sm text-white/60">Indian halal, high-protein, ~{calTarget} kcal target</p>
      </header>

      <section className="mb-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-300">Eaten today</p>
            <p className="mt-1 text-3xl font-bold">{totalCals} <span className="text-base font-normal text-emerald-200">/ {calTarget} kcal</span></p>
          </div>
          <p className={`text-sm ${remaining < 0 ? "text-red-300" : "text-emerald-200"}`}>
            {remaining >= 0 ? `${remaining} kcal left` : `${Math.abs(remaining)} over`}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <Macro label="Protein" value={`${Math.round(totalProtein)}g`} sub={`/ ${proteinTarget}g`} hit={totalProtein >= proteinTarget * 0.8} />
          <Macro label="Carbs" value={`${Math.round(totalCarbs)}g`} sub="~220g" />
          <Macro label="Fat" value={`${Math.round(totalFat)}g`} sub="~60g" />
        </div>
        {cyclingMinutesToBalance > 0 && (
          <p className="mt-3 rounded-lg bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
            ⚠ {surplus} kcal over target. Cycle {cyclingMinutesToBalance} extra minutes to balance, or fast tomorrow morning.
          </p>
        )}
        {remaining > 200 && totalCals > 0 && (
          <p className="mt-3 rounded-lg bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
            ✓ On track. {remaining} kcal of budget remaining.
          </p>
        )}
      </section>

      {/* Today's logged meals */}
      {mealsToday.length > 0 && (
        <>
          <h2 className="mt-6 mb-2 text-xs uppercase tracking-widest text-white/40">Logged today</h2>
          <ul className="mb-4 space-y-2">
            {mealsToday.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-white/50">{m.mealType} · {m.calories} kcal · {Math.round(m.proteinG ?? 0)}g protein</p>
                </div>
                <form action={deleteMeal}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="text-xs text-red-400" type="submit">Remove</button>
                </form>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Pick from plan */}
      <h2 className="mt-6 mb-3 text-sm uppercase tracking-widest text-white/40">Tap a meal to log it</h2>
      <p className="mb-3 text-xs text-white/40">
        Or <Link href="/diet/photo" className="text-emerald-400 underline">snap a photo</Link> — AI estimates calories (±25%).
      </p>

      {MEAL_ORDER.map((mt) => (
        <section key={mt} className="mb-5">
          <h3 className="mb-2 text-base font-semibold capitalize text-white/80">{mt}</h3>
          <ul className="space-y-2">
            {(byMeal[mt] ?? []).map((p) => (
              <li key={p.id}>
                <form action={logMealFromPlan}>
                  <input type="hidden" name="planId" value={p.id} />
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left transition active:bg-white/10"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="ml-2 shrink-0 text-sm font-semibold text-emerald-300">{p.calories} kcal</p>
                    </div>
                    {p.description && <p className="mt-1 text-xs text-white/50">{p.description}</p>}
                    <p className="mt-1 text-[11px] text-white/40">
                      P {Math.round(p.proteinG)}g · C {Math.round(p.carbsG)}g · F {Math.round(p.fatG)}g
                      {p.fiberG ? ` · Fib ${Math.round(p.fiberG)}g` : ""}
                    </p>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

function Macro({ label, value, sub, hit }: { label: string; value: string; sub: string; hit?: boolean }) {
  return (
    <div className={`rounded-lg ${hit ? "bg-emerald-700/30" : "bg-white/5"} p-2`}>
      <p className="text-[10px] uppercase text-white/50">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-[10px] text-white/40">{sub}</p>
    </div>
  );
}
