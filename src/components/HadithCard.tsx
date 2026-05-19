import type { HadithRecord } from "@/lib/hadith";

const categoryLabel: Record<string, string> = {
  "neglect-salah": "On abandoning salah",
  "missed-salah": "On missing prayers",
  "missed-fajr": "On Fajr",
  "missed-isha": "On Isha",
  "missed-asr": "On Asr",
  virtues: "On the virtues of salah",
  encouragement: "Allah's mercy",
  "on-time": "Praying on time",
  congregation: "Praying in congregation",
  repentance: "On repentance",
  focus: "On khushu' (focus)",
};

const isWarning = (cat: string) =>
  ["neglect-salah", "missed-salah", "missed-fajr", "missed-isha", "missed-asr"].includes(cat);

export function HadithCard({ hadith }: { hadith: HadithRecord | null }) {
  if (!hadith) return null;

  const warning = isWarning(hadith.category) && hadith.severity >= 4;
  const wrapper = warning
    ? "border-red-900/50 bg-gradient-to-br from-red-950/40 to-black/40"
    : "border-emerald-900/40 bg-gradient-to-br from-emerald-950/40 to-black/40";
  const labelColor = warning ? "text-red-300" : "text-emerald-300";
  const textColor = warning ? "text-red-50" : "text-emerald-50";

  return (
    <div className={`mb-4 rounded-2xl border p-5 ${wrapper}`}>
      <div className="flex items-center justify-between">
        <p className={`text-[10px] uppercase tracking-widest ${labelColor}`}>
          {categoryLabel[hadith.category] ?? "Reflection"}
        </p>
        {warning && (
          <span className="rounded-full bg-red-900/40 px-2 py-0.5 text-[10px] text-red-200">
            ⚠ Strong warning
          </span>
        )}
      </div>
      {hadith.arabic && (
        <p className="mt-3 text-right text-lg leading-loose text-amber-200" dir="rtl">
          {hadith.arabic}
        </p>
      )}
      <p className={`mt-3 text-base leading-relaxed ${textColor}`}>&ldquo;{hadith.english}&rdquo;</p>
      <p className="mt-3 text-xs text-white/50">— {hadith.reference}</p>
    </div>
  );
}
