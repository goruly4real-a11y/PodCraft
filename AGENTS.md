# AGENTS.md

## Project Overview
PodCraft — AI podcast creation platform. React 19 + TypeScript + Vite + Tailwind CSS v4 + Supabase + Cloudflare Workers.

## Commands
- `npm run dev` — Start dev server on port 5173
- `npm run build` — TypeScript compile + Vite build → `dist/`
- `npm run preview` — Preview production build
- `npm run lint` — Broken (no eslint config exists, ignore this)

## Build Must Succeed Before Push
`npm run build` runs `tsc -b && vite build`. Fix all TypeScript errors before committing. The build is strict: `noUnusedLocals`, `noUnusedParameters`, `strict: true`.

## Architecture
- **Frontend:** React SPA in `src/`, deployed to Cloudflare Pages
- **Backend API:** Cloudflare Workers in `api/` (separate deployment, no wrangler.toml yet)
- **Database:** Supabase (PostgreSQL + RLS + Auth). Schema in `supabase/migrations/001_initial_schema.sql`
- **Auth:** Supabase magic link. Callback route at `/auth/callback`
- **Payments:** Flutterwave (NGN). Client in `src/lib/flutterwave.ts`, webhook in `api/verify-payment.ts`
- **AI:** Google Gemini API in `src/lib/gemini/index.ts` (client-side currently)
- **State:** Zustand stores in `src/store/index.ts` (auth, speakers, podcasts, credits, UI)

## Key Conventions
- Path alias: `@/*` → `./src/*`
- No ESLint config — TypeScript strict mode is the only type checking
- No Prettier — no formatting config
- Tailwind CSS v4 with `@theme inline` in `src/index.css` (no tailwind.config.js)
- Package manager: npm (package-lock.json)
- Git workflow: push directly to `main`, no branches/PRs

## Env Variables
- Client-side (in `.env.local`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`, `VITE_APP_URL`, `VITE_FLUTTERWAVE_PUBLIC_KEY`
- Server-side (in Cloudflare dashboard): `FLW_SECRET_KEY`, `FLW_SECRET_HASH`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Database Tables
`user_credits`, `transactions`, `speakers`, `podcasts` — all have RLS enabled. Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor to set up.

## Credit Formula
`ceil((duration_minutes × speaker_count) / 5)` — defined in `src/lib/credits.ts`

## Deployment
- **Frontend:** Cloudflare Pages. Build: `npm run build`, output: `dist/`
- **API Workers:** `api/` directory, deployed separately to Cloudflare Workers (no wrangler config yet)
- **Supabase:** Run migration SQL manually in dashboard

## Gotchas
- `@types/three` must stay in `devDependencies` (was in `dependencies`, caused Cloudflare deploy failures)
- Gemini API key is currently exposed client-side — should move server-side
- Ad components (`src/components/ads/`) are placeholder shells — no real ad network integrated yet
- `src/components/auth/` and `src/components/speakers/` are empty directories
- `068df8e86ea8d3b09b93.txt` is a HilltopAds domain verification file — do not delete
