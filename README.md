# FocusForge

ADHD-friendly task manager designed to reduce decision fatigue and keep momentum.

## Why this project exists

FocusForge is built for people who struggle with attention drift, task paralysis, and constant context switching (especially ADHD brains). The goal is to make starting and finishing work easier by reducing choices, nudging focus, and keeping the interface simple enough to stay in flow.

## What it does

- **Single-task focus flow** with reminders (gentle, firm, aggressive)
- **Smart “Pick for me”** task selection to lower startup friction
- **Weekly planner** with scheduled tasks
- **Goals + task linking** to keep work connected to bigger outcomes
- **Parking Lot** for quick thought capture without context switching
- **Focus sessions (Pomodoro-style)** with configurable work/break durations
- **Stats view** for completed tasks and focus progress
- **Cloud sync (optional)** via Supabase
- **Cross-platform targets**: Web, Electron desktop (Windows build script included), and Android (Capacitor)

## Tech stack

- React 19 + TypeScript + Vite
- Zustand (persisted local state)
- Tailwind CSS v4
- Framer Motion
- Supabase (optional sync)
- Electron + electron-builder
- Capacitor (Android)

## Prerequisites

- Node.js 20+
- npm
- For Android: Android Studio + Android SDK

## Getting started

```bash
npm install
npm run dev
```

Vite dev server runs at `http://localhost:5173` by default.

## Scripts

- `npm run dev` — run web app in development
- `npm run dev:electron` — run Vite + Electron together
- `npm run build` — type-check + build web bundle
- `npm run build:electron` — build desktop app (Windows target)
- `npm run build:android` — build web assets and sync Capacitor Android project
- `npm run lint` — run ESLint
- `npm run preview` — preview production build locally

## Desktop (Electron)

Development:

```bash
npm run dev:electron
```

Production build (Windows):

```bash
npm run build:electron
```

## Android (Capacitor)

Sync the latest web build into the Android project:

```bash
npm run build:android
```

Then open Android Studio from the `android/` project and run on emulator/device.

## Optional cloud sync (Supabase)

Set environment variables first:

1. Copy `.env.example` to `.env`
2. Set `VITE_SUPABASE_URL` to your Supabase project URL
3. Add your `VITE_SUPABASE_ANON_KEY`

Then configure in app **Settings**:

1. Enable **Cloud Sync**
2. Confirm Supabase URL (auto-filled from env)
3. Confirm/paste Supabase anon key

Create the table in Supabase SQL Editor:

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  estimated_minutes INTEGER DEFAULT 25,
  elapsed_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  focused_at TIMESTAMPTZ,
  scheduled_date DATE,
  task_order INTEGER DEFAULT 0
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

## Project structure

- `src/components` — UI components and panels
- `src/stores/taskStore.ts` — app state, actions, persisted settings
- `src/hooks/useNagger.ts` — reminder/nag behavior
- `src/hooks/useSync.ts` — Supabase sync orchestration
- `src/lib` — notifications, sounds, Supabase client utilities
- `electron/` — desktop entry + preload
- `android/` — Capacitor Android project

## Notes

- Data is stored locally via persisted Zustand state by default.
- Notification behavior depends on platform permission settings.
- Cloud sync is optional and off by default.
