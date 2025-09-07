Deployment guide — Vercel + Supabase (easiest & cheapest)

This repository uses Next.js (App Router) + Prisma + PostgreSQL and is designed to deploy quickly with minimal ops using the free/low-cost stack:
- Vercel for the Next.js app
- Supabase for Postgres and Storage

This document gives the minimal steps and environment variables to get a production deploy working.

1) Provision infra
- Create a Supabase project (free tier is fine for development).
- Create a storage bucket in Supabase for uploads (e.g. `uploads`).
- Obtain the Supabase connection string (DATABASE_URL), the Project URL and the anon/service_role keys.

2) Local prep (one-time)
```bash
# from repo root
npm ci
npx prisma generate
# Ensure DATABASE_URL points to Supabase in your shell or .env file
npx prisma migrate deploy
# optional seed
node prisma/seed.js
```

3) Environment variables (add these to Vercel project settings, Production scope)
- DATABASE_URL — Postgres connection string from Supabase (server-side only)
- NEXTAUTH_SECRET or JWT_SECRET — long random secret used for auth/JWT
- NEXT_PUBLIC_SUPABASE_URL — Supabase project URL (only if client uses Supabase directly)
- NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key (only if client-side access is required)
- SUPABASE_SERVICE_ROLE_KEY — Supabase service_role key (server-only) — keep secret
- STORAGE_BUCKET — name of Supabase Storage bucket (e.g. `uploads`)
- NEXT_PUBLIC_BASE_URL — https://<your-vercel-app>
- STRIPE_SECRET, CLOUDINARY_URL, etc. — any third-party secrets used by the app

4) Deploy with Vercel
- Connect your GitHub repo to Vercel and set the production branch (main).
- Vercel will build automatically on push.
- If you do not run migrations automatically in CI, run `npx prisma migrate deploy` once against the production `DATABASE_URL` after creating the Supabase project.

Notes & gotchas
- Connections: serverless platforms can exhaust Postgres connections. If you see "too many connections" errors:
  - Use Neon (serverless-friendly Postgres) OR
  - Use Prisma Data Proxy (small cost) OR
  - Use a connection pooler like PgBouncer in front of a managed RDS (more ops)
- Prisma: always run `npx prisma generate` during your build step and `npx prisma migrate deploy` when releasing schema changes.
- Storage: Supabase Storage is fine for early-stage projects — you can move to S3/Spaces later.

Quick checklist to finish deploy
- [ ] Create Supabase project + storage bucket
- [ ] Add env vars to Vercel (Production)
- [ ] Run Prisma migrations on production DB: `npx prisma migrate deploy`
- [ ] Push to `main` (Vercel will build)
- [ ] Test flows: register/login, create booking, submit review, upload proof image

If you’d like I can add a tiny GitHub Action that runs `npx prisma migrate deploy` on push to `main`. I can also wire a small `deploy.sh` script to simplify one-off tasks.

Contact / Troubleshooting
- If you get DB connection errors, tell me the error and I’ll suggest the minimal mitigation (Data Proxy vs Neon).
- If you want automated migrations, tell me whether you prefer a GitHub Action or running migrations from an admin machine and I’ll add the files for you.
