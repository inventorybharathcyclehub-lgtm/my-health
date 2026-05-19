import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayIST(): Date {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffsetMs);
  ist.setUTCHours(0, 0, 0, 0);
  return ist;
}

export const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerName = (typeof PRAYERS)[number];

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return +(weightKg / (m * m)).toFixed(1);
}

// Caloric deficit math used in the dashboard
export function dailyCalorieTarget(weightKg: number, heightCm: number, age: number, activityFactor = 1.4) {
  // Mifflin-St Jeor for males
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const tdee = bmr * activityFactor;
  const deficit = 800; // aggressive but bounded
  return Math.round(tdee - deficit);
}
