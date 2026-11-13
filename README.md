# Death Clock

A desktop and web application for reflecting on time and building healthier habits.

## First milestone

A React + TypeScript web interface and FastAPI backend with a live countdown, editable birth date and planning age, browser-local persistence, and input validation. This version uses a **user-selected planning age**, not a statistical life expectancy model. No health adjustments or predicted death dates are claimed. Dates use UTC; February 29 anniversaries fall on February 28 in non-leap years.

## Run locally

Install Node.js 22.12+ and Python 3.11+. From the repository root:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

On Windows, use `py` instead of `python3`, and `.venv\Scripts\Activate.ps1` to activate in PowerShell.

In a second terminal:

```sh
cd frontend
npm install
npm run dev
```

Open http://127.0.0.1:5173. Vite proxies `/api` to FastAPI. API documentation is at http://127.0.0.1:8000/docs.

The frontend also has a pnpm lockfile; use `pnpm install --frozen-lockfile` for the exact verified dependency versions. Node.js must be on PATH for the frontend scripts.

## Verify

```sh
python -m pytest backend/tests
cd frontend
npm run build
```

A production deployment must route `/api` to FastAPI; Vite's development proxy is not part of the built assets.

## Privacy

There are no accounts, database, or analytics. The birth date is sent to the local backend to calculate the chosen horizon. The plan stays in this browser's local storage until cleared. Google Fonts supplies optional fonts; system fonts work if unavailable.

## Next milestones

- Choose documented life-table data and a defensible statistical model, including limitations and uncertainty.
- Add demographic inputs and clearly sourced estimates.
- Integrate Tauri for macOS and Windows. Desktop packaging and offline backend support are not implemented yet.
