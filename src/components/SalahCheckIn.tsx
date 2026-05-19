"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Location = { id: string; name: string; lat: number; lng: number; radiusM: number };

// Haversine distance in meters
function distM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function SalahCheckIn({ mosques }: { mosques: Location[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function checkIn() {
    setStatus("");
    if (mosques.length === 0) {
      setStatus("No mosque saved. Go to Locations to add one.");
      return;
    }
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        let nearest: Location | null = null;
        let nearestM = Infinity;
        for (const m of mosques) {
          const d = distM(here, { lat: m.lat, lng: m.lng });
          if (d < nearestM) {
            nearestM = d;
            nearest = m;
          }
        }
        if (!nearest || nearestM > nearest.radiusM) {
          setStatus(`Not at any saved mosque (closest: ${nearest?.name ?? "?"} at ${Math.round(nearestM)}m away).`);
          setBusy(false);
          return;
        }
        // POST to the check-in endpoint
        const res = await fetch("/api/salah/checkin", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ locationId: nearest.id, lat: here.lat, lng: here.lng }),
        });
        const j = await res.json();
        if (j.ok) {
          setStatus(`✓ Marked ${j.prayer} as prayed at ${nearest.name} (${Math.round(nearestM)}m away).`);
          router.refresh();
        } else {
          setStatus(j.error ?? "Could not check in.");
        }
        setBusy(false);
      },
      (err) => {
        setStatus(`GPS error: ${err.message}`);
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-blue-900/40 bg-blue-950/20 p-3">
      <button
        type="button"
        onClick={checkIn}
        disabled={busy}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium disabled:opacity-50"
      >
        {busy ? "Checking location…" : "📍 Check in at mosque"}
      </button>
      {status && <p className="mt-2 text-xs text-blue-200">{status}</p>}
      {mosques.length === 0 && (
        <p className="mt-2 text-xs text-amber-200">
          ⚠ No mosque saved yet — <a href="/locations" className="underline">add one here</a>.
        </p>
      )}
    </div>
  );
}
