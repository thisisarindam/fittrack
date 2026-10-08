# FitTrack

FitTrack is a lightweight workout tracking app for gym-goers who want a simple weekly training plan, easy logging, and a clear view of workout history. It is built with Next.js and PostgreSQL, and it focuses on a recurring 3-day full-body schedule with session tracking and exercise set logging.

## Features

- Weekly workout plan with recurring Monday, Wednesday, and Saturday sessions
- Start and resume workout sessions
- Log exercise sets, reps, weights, completion status, and notes
- Track recent workout history and completed sessions
- View workout details for each scheduled day
- Built-in REST-style API routes for health checks, sessions, and logs
- Postgres-backed persistence through Drizzle ORM

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- PostgreSQL
- Drizzle ORM
- Tailwind CSS

## Project Structure

```text
fittrack/
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ health/
│  │  │  ├─ logs/
│  │  │  └─ sessions/
│  │  ├─ history/
│  │  ├─ session/
│  │  ├─ workout/
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  └─ template.tsx
│  ├─ components/
│  │  ├─ delete-session-button.tsx
│  │  ├─ rest-timer.tsx
│  │  ├─ session-player.tsx
│  │  ├─ site-header.tsx
│  │  └─ start-workout-button.tsx
│  ├─ db/
│  │  ├─ index.ts
│  │  └─ schema.ts
│  └─ lib/
│     ├─ plan.ts
│     └─ summary.ts
├─ drizzle.config.json
├─ eslint.config.mjs
├─ next.config.ts
├─ package.json
├─ postcss.config.mjs
├─ tsconfig.json
├─ README.md
└─ .
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your database

This app expects a PostgreSQL connection string in the environment as `DATABASE_URL`.

Example:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

Make sure PostgreSQL is running locally or in your preferred environment before starting the app.

### 3. Set up the database schema

```bash
npx drizzle-kit push
```

This creates the tables defined in the schema, including workout sessions and exercise logs.

### 4. Run the app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev       # start the development server
npm run build     # create a production build
npm run start     # run the production build
npm run lint      # run ESLint
npm run typecheck # run TypeScript checks
```

## Core App Flow

1. The home page shows the next scheduled workout and a summary of recent activity.
2. Users can start a workout session for the upcoming scheduled day.
3. The workout page displays the exercise list and progression plan.
4. Users log reps, weights, and completion states for each exercise.
5. Session history is stored in PostgreSQL and can be reviewed later.

## Database Model

The app currently uses two main tables:

- `workout_sessions`
  - Stores the session start time, completion time, and workout day
- `exercise_logs`
  - Stores exercise-level logs for a session, including set details and notes

This is defined in the schema under `src/db/schema.ts` and managed with Drizzle.

## Notes

- The workout program is currently built around a simple three-day split: Monday, Wednesday, and Saturday.
- The schedule and exercise catalog are defined in `src/lib/plan.ts`.
- The app is meant to be a simple self-tracking tool, not a full commercial gym platform.

## License

This project is currently unlicensed unless you add a license file and update this section.

## Contributing

If you want to extend the project, a few good next steps are:

- add user authentication
- improve analytics and stats
- add workout editing and template management
- add mobile-first polish and better timer UX
- expand API validation and error handling

---

This README is intentionally basic and meant to help someone understand the app quickly and get it running locally.
