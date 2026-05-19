"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Estimate = {
  name: string;
  mealType: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: "high" | "medium" | "low";
  notes: string;
};

export function MealPhotoUploader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Estimate | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(file));
    setBusy(true);

    const form = new FormData();
    form.append("photo", file);

    try {
      const res = await fetch("/api/meal/analyze", { method: "POST", body: form });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Could not analyze photo");
      } else {
        setResult(json.estimate);
        router.refresh();
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">Upload meal photo</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:px-4 file:py-3 file:text-sm file:font-medium hover:file:bg-emerald-500"
        />
      </label>

      {preview && (
        <div className="overflow-hidden rounded-xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="meal preview" className="block max-h-96 w-full object-cover" />
        </div>
      )}

      {busy && (
        <p className="rounded-lg bg-blue-950/30 px-3 py-2 text-sm text-blue-200">
          Analyzing with Claude Haiku 4.5… (≈3-5 sec)
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-950/30 px-3 py-2 text-sm text-red-200">{error}</p>
      )}

      {result && (
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/30 p-4">
          <p className="text-xs uppercase tracking-widest text-emerald-300">Logged ✓</p>
          <p className="mt-1 text-lg font-semibold">{result.name}</p>
          <p className="text-xs text-white/60 capitalize">{result.mealType} · confidence: {result.confidence}</p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-sm">
            <Stat label="kcal" value={result.calories} />
            <Stat label="P" value={`${result.proteinG}g`} />
            <Stat label="C" value={`${result.carbsG}g`} />
            <Stat label="F" value={`${result.fatG}g`} />
          </div>
          <p className="mt-3 text-xs italic text-white/60">{result.notes}</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white/5 p-2">
      <p className="text-[10px] uppercase text-white/40">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}
