# SAHEB ERP Production Package Manifest

Package generated for the audited handoff after commit `fa32e59`.

## Included in `/workspace/saheb-erp-project.zip`

- Next.js App Router source under `app/`
- Arabic RTL reusable components under `components/`
- Supabase REST/Auth/Storage helpers and ERP utilities under `lib/`
- Middleware authentication and context propagation in `middleware.ts`
- Supabase schema and production seed guidance under `supabase/`
- Deployment, audit, architecture, backup, go-live, and handoff documentation under `docs/`
- CI workflow under `.github/workflows/ci.yml`
- Smoke-test script under `scripts/smoke-test.mjs`
- Project config: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, Tailwind/PostCSS/ESLint config, `.env.example`, and `.gitignore`

## Excluded from the ZIP

- `.git/`
- `node_modules/`
- `.next/`

## Production operator responsibilities

- Push the source to GitHub from a network-enabled machine.
- Apply `supabase/schema.sql` to the production Supabase project.
- Configure Vercel environment variables from `.env.example`.
- Run CI, smoke tests, and business workflow checks before go-live.
- Keep secrets out of the repository and rotate production credentials according to company policy.
