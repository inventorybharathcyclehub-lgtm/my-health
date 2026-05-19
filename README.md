# Deen & Body

Personal salah + weight + sleep + cycling tracker. Web app, deploys to Vercel, installable as PWA on Android.

## Goal

Track all four life pillars in one place:
1. Salah (5 daily prayers with qada-debt counter + hadith accountability)
2. Weight (101 → 80 kg over 4-6 months)
3. Sleep (7-8 h target)
4. Cycling (ramp 10 → 40 km/day)

## Tech stack

- Next.js 15 App Router + TypeScript
- Vercel Postgres (Neon) via Prisma ORM
- Tailwind for styling
- Aladhan API for Bangalore prayer times (Shafi standard)
- PWA manifest for Android home-screen install

## Local setup

```bash
npm install
cp .env.example .env.local
# fill in DATABASE_URL (Vercel Postgres or local Postgres)
npm run db:push      # creates tables
npm run db:seed      # seeds hadith bank
npm run dev          # http://localhost:3000
```

## Deploy to Vercel

1. Create a Vercel project pointing at this GitHub repo (https://github.com/inventorybharathcyclehub-lgtm/my-health)
2. In the Vercel dashboard → **Storage** → **Create Database** → **Postgres**. Vercel will auto-set `DATABASE_URL` and `DIRECT_URL`.
3. Add env vars in Vercel:
   - `NEXTAUTH_SECRET` — run `openssl rand -base64 32` to generate
   - `NEXTAUTH_URL` — set to your deployed URL (e.g. `https://my-health.vercel.app`)
   - `CRON_SECRET` — any random string; same value must be in the Vercel Cron config header
4. Push to `main`. Vercel auto-deploys.
5. After first deploy, run migrations from Vercel CLI or local:
   ```bash
   vercel env pull .env.local
   npm run db:push
   npm run db:seed
   ```
6. Open the deployed URL on Android Chrome → **Add to Home Screen**. Done.

## Fitness band integration

V1 is **manual entry only**. Wear a Pebble Qore 2 (₹3,699) or similar, check its app each morning, type sleep/HR into our app (20 sec). V2 may add CSV import. Full auto-sync via Google Health Connect requires Android-native wrapper, out of scope for V1.

## Roadmap

- [ ] NextAuth Google sign-in (replace hardcoded `demo-syed`)
- [ ] Meal logging with calorie targets
- [ ] Daily mood/productivity micro-survey
- [ ] Blood report uploads + trend charts
- [ ] Weekly Claude-powered insights summary
- [ ] Capacitor wrap + Health Connect for auto-sync (V3)
