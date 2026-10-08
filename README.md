# StudyFlow

A dark-first study tracker for students and competitive-exam / SDE interview prep.
Built with React 18, Vite, Tailwind CSS 3, React Router, Recharts and Lucide icons.
All data lives in your browser's localStorage, so there is no backend.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

Requires Node 18+.

## Features

| Page | What it does |
| --- | --- |
| Dashboard | Greeting, daily goal ring, stats, weekly chart, today's tasks, continue learning, revision due |
| Subjects | Add / edit / delete subjects with progress, hours, difficulty, last studied |
| Topics | Status, difficulty, confidence (1–5), notes, resources, study time, revision dates; status and subject filters |
| Tasks | CRUD, search, filter by subject / priority / status, sort by deadline or priority |
| Focus Timer | Pomodoro with custom durations, subject/topic picker, auto-records sessions; keeps running across pages |
| Calendar | Monthly view (green = goal met, yellow = partial, red = missed) with per-day details |
| Revision | Spaced schedule 1 → 3 → 7 → 14 → 30 days; Review now / Mark revised / Reschedule |
| Goals | Daily, weekly, monthly and long-term goals with progress bars and rings |
| Analytics | 7 days / 30 days / 3 months / all time; bar, line and donut charts; consistency and productivity stats |
| Achievements | XP, levels, streaks and 6 achievements |
| Interview Prep | Problems by difficulty per category, topic progress, mock interview log |
| Study Planner | Generates a weekly plan from your inputs; every item is editable |
| Settings | Name, daily goal, Pomodoro default, theme, notifications, export JSON, restore sample data, erase data |

## Project structure

```
src/
  main.jsx          entry point (Router + store provider)
  App.jsx           layout: sidebar, top bar, mobile nav, routes, dialogs, toasts
  store.jsx         single state store: seed data, CRUD actions, timer, derived stats, localStorage sync
  ui.jsx            shared components: Modal, FormModal, Bar, Ring, Empty, Head
  pages/
    Dashboard.jsx
    Library.jsx     Subjects, Topics, Tasks
    Focus.jsx       Timer, Calendar, Revision
    Insights.jsx    Goals, Analytics, Achievements
    More.jsx        Interview Prep, Planner, Settings
```

## How things work

- **State:** `store.jsx` holds everything in one object, persisted to localStorage under `studyflow-v1`. Use the `useStore()` hook to get `{ s, a, st, toast, confirm, timer }`: state, actions, derived stats, notifications, confirm dialog and timer.
- **Streak:** consecutive days with at least one recorded session, counting back from today (or yesterday if you haven't studied yet today).
- **XP:** study minutes + 20 per completed task + 50 per completed topic + 5 per problem solved. Level = XP / 500.
- **Revision:** marking a topic revised moves it up one step in 1 / 3 / 7 / 14 / 30 days and sets the next date.
- **Timer:** uses wall-clock time, so it stays accurate in background tabs. A finished focus session adds minutes to the topic and logs a session that feeds the dashboard, calendar and analytics.

## Data

- **Export:** Settings → Export data downloads a JSON backup.
- **Sample data:** the app starts with realistic demo data. Settings → Restore sample data brings it back at any time.
- **Reset:** Settings → Reset data erases everything.

## Known limitations

- Goal progress is updated with the +1 / −1 buttons, not computed from sessions.
- The planner distributes subjects round-robin; it doesn't yet use the exam date or skill level.
- Subject details open the Topics page filtered to that subject.
- Notifications are in-app only (due revisions and overdue tasks); there's no browser push.
- No backend or sync: data is per browser. Clearing site data erases it, so export regularly.

## Ideas for next steps

TypeScript migration, Supabase or Firebase sync, goals linked to real session data, a planner that works backwards from the exam date, PWA / Capacitor packaging.
