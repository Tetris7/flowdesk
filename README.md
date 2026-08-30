# FlowDesk

Project management, without the chaos.

A full project-management platform: projects, tasks, a drag-and-drop Kanban board, team management, a calendar, and analytics — all in one authenticated dashboard.

## Running it locally

```bash
npm install
npm run dev
```

Open the local URL it prints (usually `http://localhost:5173`). Sign up with any real email and password to create an account — Supabase creates it for real, and a small starter project appears on your first login so the dashboard isn't empty.

To build for production:

```bash
npm run build
npm run preview
```

## Tech stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** — custom design tokens (see `tailwind.config.js`)
- **React Router** for all page routing
- **Recharts** for the analytics charts
- **dnd-kit** for the Kanban drag-and-drop
- **Lucide React** for icons

## About the data layer

This app is connected to a **real Supabase project** — real authentication, a real Postgres database, and row-level security so each user only ever sees their own projects and tasks.

`.env.local` already has this project's Supabase URL and anon key filled in, so `npm install && npm run dev` connects immediately with no extra setup. If you ever need to point this at a *different* Supabase project (a fresh one, or moving to a new account), update the two values in `.env.local`:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

and re-run `supabase-schema.sql` in that project's SQL Editor to recreate the tables.

`src/lib/db.ts` and `src/lib/auth.ts` hold every Supabase call the app makes — CRUD for projects/tasks/comments/notifications/activity, plus sign up, sign in, sign out, and session handling. `src/lib/supabaseClient.ts` is the single client instance everything else imports.

**Deploying this?** Whatever host you use (Vercel, Netlify, etc.) needs the same two environment variables set in its dashboard — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — since `.env.local` itself isn't committed to git.

## Project structure

```
src/
  types/index.ts        # Shared types — mirrors the Supabase schema exactly
  lib/
    supabaseClient.ts    # The one Supabase client instance
    db.ts                # Every data query (projects, tasks, comments, etc.)
    auth.ts              # Sign up / sign in / sign out / session
    utils.ts, useAsync.ts
  context/
    AuthContext.tsx       # Current user + auth actions
    ThemeContext.tsx      # Light/dark mode
  components/
    layout/                # Sidebar, Topbar, AppLayout, ProtectedRoute
    ui/                     # Avatar, Chips, Modal, ProgressBar, loading/empty/error states
    dashboard/, projects/, tasks/, kanban/, team/
  pages/                  # One file per route
```

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/login`, `/signup` | Authentication |
| `/dashboard` | KPIs, recent tasks, project progress, activity |
| `/projects`, `/projects/:id` | Project list and detail (Overview / Members / Tasks / Activity / Progress tabs) |
| `/tasks` | All tasks — list or Kanban board view, with filters |
| `/team` | Team directory with search and role filters |
| `/calendar` | Month view of every task deadline |
| `/analytics` | Weekly completion, status distribution, productivity trend, overdue count, average completion time |
| `/settings` | Profile, theme, notification preferences, account |

## Notes

- Every data-driven view handles loading, empty, and error states, with retry buttons where a request can fail.
- The sidebar collapses behind a menu button on mobile; the Kanban board scrolls horizontally on small screens.
- Dark mode is a class-based Tailwind toggle, persisted in `localStorage`.
