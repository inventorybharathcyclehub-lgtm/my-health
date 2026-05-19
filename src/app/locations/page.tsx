import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { LocationPicker } from "@/components/LocationPicker";

export const dynamic = "force-dynamic";

const USER_ID = "demo-syed";

async function addLocation(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const kind = formData.get("kind") as string;
  const lat = parseFloat(formData.get("lat") as string);
  const lng = parseFloat(formData.get("lng") as string);
  const radiusM = parseInt(formData.get("radiusM") as string, 10) || 75;
  if (!name || !kind || isNaN(lat) || isNaN(lng)) return;
  await prisma.location.create({
    data: { userId: USER_ID, name, kind, lat, lng, radiusM },
  });
  revalidatePath("/locations");
  revalidatePath("/salah");
}

async function deleteLocation(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.location.delete({ where: { id } });
  revalidatePath("/locations");
  revalidatePath("/salah");
}

export default async function LocationsPage() {
  const locations = await prisma.location.findMany({ where: { userId: USER_ID }, orderBy: { createdAt: "asc" } });

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <header className="mb-4">
        <Link href="/" className="text-xs text-white/60">← Home</Link>
        <h1 className="mt-2 text-2xl font-semibold">Locations</h1>
        <p className="text-sm text-white/60">Pin your mosque so the app can auto-mark salah when you check in there.</p>
      </header>

      <div className="mb-6 rounded-xl bg-amber-950/30 border border-amber-900/40 p-3 text-xs text-amber-200">
        ⚠️ <strong>How this works on iPhone:</strong> iOS does not let web apps run in the background. So we can&apos;t
        auto-detect arrival. Instead, you tap <strong>&ldquo;Check in at mosque&rdquo;</strong> on the Salah page when you arrive —
        the app verifies you&apos;re within range and auto-marks the current prayer.
      </div>

      <LocationPicker action={addLocation} />

      <h2 className="mt-6 mb-2 text-xs uppercase tracking-widest text-white/40">Saved locations</h2>
      <ul className="space-y-2">
        {locations.map((l) => (
          <li key={l.id} className="flex items-start justify-between rounded-xl bg-white/5 p-3 text-sm">
            <div>
              <p className="font-medium">{l.name}</p>
              <p className="text-xs text-white/50 capitalize">
                {l.kind} · {l.lat.toFixed(5)}, {l.lng.toFixed(5)} · {l.radiusM}m radius
              </p>
            </div>
            <form action={deleteLocation}>
              <input type="hidden" name="id" value={l.id} />
              <button type="submit" className="text-xs text-red-400">Delete</button>
            </form>
          </li>
        ))}
        {locations.length === 0 && <li className="text-xs text-white/40">No locations yet. Add your mosque below.</li>}
      </ul>
    </main>
  );
}
