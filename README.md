# FitTrack

FitTrack is a lightweight workout tracker for a recurring Monday, Wednesday, and Saturday training plan. It is a static Next.js site that can be hosted on GitHub Pages.

## Features

- Browse the weekly workout plan and exercise instructions
- Start and resume workouts
- Log sets, reps, weights, completion status, and notes
- Review and delete workout history
- Save workout data in the current browser

## Tech stack

- Next.js 16, React 19, and TypeScript
- Tailwind CSS
- Browser `localStorage` for workout data

Workout data is stored only in the browser and device where it is entered. It is not synced between users, browsers, or devices, and clearing that browser's site data removes it.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds the static export and deploys it whenever a commit is pushed to `main`.

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main`, or run **Deploy to GitHub Pages** from the **Actions** tab.
4. After the workflow succeeds, open <https://thisisarindam.github.io/fittrack/>.

The Pages workflow builds with `/fittrack` as the base path so that app routes and exercise images work when hosted under the repository URL.

## Available scripts

```bash
npm run dev       # start the development server
npm run build     # create a static export in out/
npm run lint      # run ESLint
npm run typecheck # run TypeScript checks
```
