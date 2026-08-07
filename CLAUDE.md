# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

CleanOps ("Vite Control - Fichaje") is a Spanish-language PWA for cleaning-crew time tracking: staff clock in/out (`fichaje`) by scanning a QR code at a site, optionally with geofence validation and a photo, and admins manage employees, shifts, leave requests, and reports. It's a two-folder repo: a Vite/React frontend and a Supabase backend (Postgres + Auth + Storage + one Edge Function).

## Commands

All frontend work happens inside `frontend/`:

```bash
cd frontend
npm install
npm run dev       # Vite dev server
npm run build      # tsc -b (project references) && vite build
npm run lint       # eslint .
npm run preview    # preview a production build
```

There is no test suite in this repo (no Jest/Vitest config, no test files) — don't assume one exists.

The root `package.json` only declares the `supabase` CLI as a dev dependency plus a couple of libs shared conceptually with the frontend; there's no root build/dev script. Supabase CLI usage (from repo root, where `supabase/config.toml` lives):

```bash
npx supabase login
npx supabase functions deploy crear-empleada
```

There are no SQL migrations in this repo — the Postgres schema (tables, RPC functions, RLS policies) is managed directly in the Supabase project dashboard, not version-controlled here. When you need to know a table's shape, infer it from the columns used in the query call sites (`.select(...)`, `.insert(...)`) rather than expecting a schema file.

### Environment

The frontend needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env.local` (see `frontend/src/lib/supabaseClient.ts`, which throws on startup if they're missing). The Edge Function needs `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_ANON_KEY` set as function secrets in Supabase.

## Architecture

### Two roles, two route trees

`useAuth.tsx` (`AuthProvider`/`useAuth`) loads a profile from the `empleadas` table keyed by the Supabase Auth user id, exposing `rol: 'empleada' | 'supervisor' | 'gerencia'`. A deactivated profile (`activo: false`) is force-signed-out, not just hidden client-side.

`App.tsx` defines two route subtrees, each behind `ProtectedRoute` with a `rolesPermitidos` allowlist:
- `/` (`EmployeeLayout`) — role `empleada`: fichar, horario, historial, justificantes.
- `/admin` (`AdminLayout`) — roles `supervisor`/`gerencia`: dashboard, empleadas, fichajes, solicitudes, informes, configuracion.

`ProtectedRoute` redirects unauthenticated users to `/login` and redirects users with the wrong role to their own home (`/` or `/admin/dashboard`) rather than showing a 403. Nav item lists live in `src/config/adminNav.ts` / `employeeNav.ts` and drive the sidebars — add new admin/employee pages there as well as in `App.tsx`.

### Data access: no ORM, one hook per feature

There's no API layer or repository abstraction — components call `supabase.from(...)` directly, but always from inside a `src/hooks/use*.ts` hook, never straight from a page/component. Follow that pattern for new features: a hook owns loading state, the Supabase query, and any derived/mutating logic; pages just consume it. Tables currently in use: `empleadas`, `fichajes`, `turnos`, `justificantes`, `notificaciones`, `ubicaciones_portales`.

Row-querying via the anon key can't reach `auth.users` directly, so where employee emails are needed the code calls a Postgres RPC instead (`supabase.rpc('get_emails_empleadas')` in `useEmpleadas.ts`) rather than querying auth tables — follow this pattern for anything else that needs privileged/joined data instead of trying to add a client-side join.

### Check-in flow and offline queue

`useCheckIn.ts` is the core domain logic:
1. Look up the scanned QR's site row in `ubicaciones_portales`.
2. Get geolocation (`lib/geoValidation.ts`, 8s timeout, fails soft to `null`) and compute Haversine distance against the site's `radio_geofence_metros`.
3. Optionally upload a photo to the `fichajes` storage bucket, tagging it `foto_antes_url`/`foto_despues_url` depending on `entrada`/`salida`.
4. Insert into `fichajes` with `metodo: 'qr_geo' | 'qr_sin_gps'`, computed distance, and `dentro_del_radio`.
5. If offline (`!navigator.onLine`) or the insert throws, the check-in is queued in IndexedDB instead (`lib/offlineQueue.ts`, via `idb`) and retried later via `sincronizarPendientes()`.

If you touch check-in logic, preserve the offline-first contract: a `registrarFichaje` call must never fail outright due to connectivity — it should queue and report success with a "saved offline" message.

Out-of-geofence check-ins aren't blocked, just flagged (`dentro_del_radio: false`) and trigger a staff notification via `lib/notificaciones.ts` (`notificarStaff`) for later review.

### Notifications

`notificaciones` rows have a `destino` of `'staff'` or `'empleada_especifica'` (+ `destinatario_id`). `notificarStaff`/`notificarEmpleada` (`lib/notificaciones.ts`) insert them; `useNotificaciones.ts` reads them scoped by role and exposes `marcarLeida`/`marcarTodasLeidas`. `NotificationBell.tsx` is the shared UI entry point for both layouts.

### Privileged operations go through the Edge Function

Creating a new employee requires `auth.admin.createUser`, which needs the service-role key and must never be called from the frontend with the anon key. That flow lives entirely in `supabase/functions/crear-empleada/index.ts`: it authenticates the caller from their JWT, re-checks their role is `supervisor`/`gerencia` server-side using a service-role client, creates the Auth user, then inserts the `empleadas` row — rolling back the Auth user if the profile insert fails. Any new admin-only mutation that needs elevated privileges (not just RLS-scoped queries) should follow this same pattern: a new Edge Function, not a frontend call with a stronger key.

### Reports/exports

`InformesPage.tsx` composes report data from hooks like `useInformeFueraDeRadio.ts`, `useAdminFichajes.ts`, etc., and exports via `lib/excelExport.ts` (xlsx) or `lib/csvExport.ts`.

### Styling and PWA

Tailwind v4 is configured CSS-first (no `tailwind.config.js`) — design tokens (`--color-primary`, `--color-surface`, fonts, etc.) live in `@theme` inside `frontend/src/index.css`, wired up via the `@tailwindcss/vite` plugin in `vite.config.ts`. Reuse those tokens for new UI rather than hardcoding colors.

The app is a PWA via `vite-plugin-pwa`, configured in `vite.config.ts` (manifest name/colors/icons). It's deployed to Vercel; `frontend/vercel.json` rewrites all paths to `/index.html` for SPA client-side routing — keep this in mind if you see 404s on direct links to nested routes.

## Conventions

- **Spanish throughout**: UI text, variable/function names, table/column names, and commit messages are all in Spanish, matching the business domain (`fichaje` = clock-in/out, `empleada` = employee, `turno` = shift, `justificante` = leave/excuse request, `ubicacion` = site). Match this when adding code — don't switch to English identifiers in the middle of a Spanish-named module.
- Commit messages are short, descriptive, imperative/noun-phrase Spanish summaries (e.g. `Grafico de horas por empleada en Informes`, `Arreglo: fallback de rutas para SPA en Vercel`); fixes are often prefixed `Arreglo:`.
