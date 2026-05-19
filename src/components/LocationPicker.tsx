"use client";

import { useState } from "react";

type Coords = { lat: number; lng: number };

export function LocationPicker({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function captureLocation() {
    setError(null);
    setBusy(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      setBusy(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBusy(false);
      },
      (err) => {
        setError(err.message);
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  return (
    <form action={action} className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-sm font-semibold">Add a new location</h2>

      <button
        type="button"
        onClick={captureLocation}
        disabled={busy}
        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium disabled:opacity-50"
      >
        {busy ? "Reading GPS…" : coords ? "📍 Re-read GPS" : "📍 Use my current location"}
      </button>

      {coords && (
        <p className="rounded-lg bg-emerald-950/30 px-3 py-2 text-xs text-emerald-200">
          Got it: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} — tap below to save.
        </p>
      )}
      {error && <p className="rounded-lg bg-red-950/30 px-3 py-2 text-xs text-red-200">{error}</p>}

      <input type="hidden" name="lat" value={coords?.lat ?? ""} />
      <input type="hidden" name="lng" value={coords?.lng ?? ""} />

      <label className="block">
        <span className="text-xs text-white/60">Name</span>
        <input
          type="text"
          name="name"
          required
          placeholder="Yelahanka New Town Masjid"
          className="mt-1 w-full rounded-lg bg-white/5 px-3 py-2 text-sm outline-none focus:bg-white/10"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs text-white/60">Type</span>
          <select
            name="kind"
            defaultValue="mosque"
            className="mt-1 w-full rounded-lg bg-white/5 px-3 py-2 text-sm outline-none focus:bg-white/10"
          >
            <option value="mosque">Mosque</option>
            <option value="home">Home</option>
            <option value="gym">Gym</option>
            <option value="work">Work</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-white/60">Radius (m)</span>
          <input
            type="number"
            name="radiusM"
            defaultValue={75}
            min={20}
            max={500}
            className="mt-1 w-full rounded-lg bg-white/5 px-3 py-2 text-sm outline-none focus:bg-white/10"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={!coords}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium disabled:opacity-30"
      >
        {coords ? "Save location" : "Capture GPS first"}
      </button>
    </form>
  );
}
