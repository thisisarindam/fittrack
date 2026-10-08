# FitTrack

A simple workout tracker for a Monday, Wednesday, and Saturday training plan.

**Live site:** <https://thisisarindam.github.io/fittrack/>

## What you can do

- View exercises, photos, and instructions
- Start or resume a workout
- Track sets, reps, weights, and notes
- Review and delete past workouts

Workout data is saved in your browser on this device. It does not sync to other devices, and clearing this site's browser data will remove it.

## Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Deployment

GitHub Actions deploys the site to GitHub Pages when changes are pushed to `main`. In the repository's **Settings → Pages**, set the source to **GitHub Actions**.

## Useful commands

```bash
npm run build     # Build the static site
npm run lint      # Run ESLint
npm run typecheck # Check TypeScript
```
