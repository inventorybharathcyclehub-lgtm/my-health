import Link from "next/link";
import { MealPhotoUploader } from "@/components/MealPhotoUploader";

export const dynamic = "force-dynamic";

export default function PhotoPage() {
  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <header className="mb-4">
        <Link href="/diet" className="text-xs text-white/60">← Diet plan</Link>
        <h1 className="mt-2 text-2xl font-semibold">Snap your meal</h1>
        <p className="text-sm text-white/60">AI estimates calories + macros. Accuracy ±20-25%.</p>
      </header>

      <div className="mb-4 rounded-xl border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-200">
        <strong>Honest note:</strong> Photo-based calorie estimates are inherently rough (±25%). For consistent
        cutting, prefer the pre-built <Link href="/diet" className="underline">diet plan</Link> where calories are
        already known. Use this for occasional meals outside the plan.
      </div>

      <MealPhotoUploader />
    </main>
  );
}
