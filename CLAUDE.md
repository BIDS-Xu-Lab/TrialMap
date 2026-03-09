# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TrialMap is a Vue.js 3 SPA that helps researchers optimize clinical trial eligibility criteria using real-world EHR data. It guides users through a 4-step wizard to select a cancer type, trial, endpoint, and eligibility criteria, then visualizes optimized pathway combinations.

Deployed to GitHub Pages at `/TrialMap/` base path. All source code lives in the `web/` subdirectory.

## Commands

All commands must be run from the `web/` directory:

```bash
cd web
npm install       # Install dependencies
npm run dev       # Start dev server (localhost:5173)
npm run build     # Production build → web/dist/
npm run preview   # Preview production build locally
```

There are no lint or test scripts configured.

## Architecture

**View switching** is managed entirely in `web/src/Main.vue` via an `activeView` ref (`'home'` | `'step'` | `'result'`). There is no Vue Router — navigation is pure component conditional rendering. `StepView` is force-remounted via `stepViewKey` counter to ensure clean state resets.

**PrimeVue** (v4) is the UI component library with auto-import via `unplugin-vue-components`. Components are resolved automatically — no explicit imports needed for PrimeVue components in templates.

## Data Sources

`web/public/data/meta_data.xlsx` has 3 sheets (parsed via `xlsx` library):
- **Sheet 0 (metadata)**: One row per trial. Columns: `cancer_type`, `trial_name`, `line_of_therapy`, `treatment`, `control`.
- **Sheet 1 (trial_criteria)**: Maps trials to their eligibility criteria. Columns: `trial_name`, `criteria_name`, `must_apply` (truthy = criteria cannot be relaxed).
- **Sheet 2 (criteria)**: Criteria details. Columns: `criteria_name`, `criteria_description`, `type`.

`web/public/data/trail_dataset/[TrialName]_results_web.csv` — Per-trial result files. Each row is one pathway (criteria combination). Columns include: `criteria` (comma-separated criteria names), `hr_os`, `hr_pfs`, `selog_hr_os`, `selog_hr_pfs`, `sucra_os`, `sucra_pfs`, `ae`, `ease`, `g_index`, `number_of_patients`, `path_id`.

## Data Pipeline: StepView (Selection)

In `StepView.vue`, on mount:
1. Fetches `meta_data.xlsx`, parses all 3 sheets into `metadata`, `trialCriteriaRows`, `criteria` refs.
2. **Step 1** — Extracts unique `cancer_type` values from sheet 0 → radio button list.
3. **Step 2** — Filters sheet 0 by selected cancer type → unique `trial_name` list. Displays each trial's `line_of_therapy`, `treatment`, `control` metadata.
4. **Step 3** — User selects endpoint (OS or PFS). PFS is disabled for AHNC cancer type (no progression data in Flatiron DB).
5. **Step 2→3 transition** (`onclickNextTreatment`): Also derives criteria for the selected trial:
   - Filters sheet 1 by `trial_name` → `trialCriteria` (list of criteria names for this trial).
   - Computes `mustApplyCriteria` set (criteria with `must_apply` truthy in sheet 1).
   - Calls `computeAvailableTokensForTrial()`: fetches the trial CSV, parses all `criteria` column values (comma-split, normalized), builds a set of tokens that actually exist in the data. Falls back to sheet 1 names if CSV fetch fails.
   - Builds `filteredCriteria`: joins sheet 2 rows by `criteria_name`, adds `must_apply` and `no_data` flags.
6. **Step 4** — Shows criteria table. `must_apply` criteria are pre-checked and disabled. User selects which criteria to enforce.
7. On "Result" click: emits `{ selectedCancerType, selectedTreatment, selectedEndpoint, selectedCriteria }` to `Main.vue`.

## Data Pipeline: ResultView (Visualization)

In `ResultView.vue`, on mount:
1. Re-fetches `meta_data.xlsx` independently (does not share state with StepView). Extracts trial metadata and criteria rows for the selected trial.
2. Fetches `[TrialName]_results_web.csv`, parses with `xlsx` library.
3. Calls `buildAllPathways(trailResult, selectedCriteria, selectedEndpoint, criteriaNameToIndex)`:
   - Normalizes all criteria tokens (lowercase, trimmed).
   - Builds `availableTokens` set from all CSV `criteria` column values.
   - Computes `effectiveSelected`: selected criteria that actually exist in the CSV (ignores missing ones for filtering).
   - Filters CSV rows: keeps rows where `criteria` column contains ALL `effectiveSelected` tokens.
   - Maps each row to a UI object with endpoint-specific fields: OS → `hr_os`/`selog_hr_os`/`sucra_os`, PFS → `hr_pfs`/`selog_hr_pfs`/`sucra_pfs`.
   - `pathName` is built from criteria indices (1-based) matching the criteria table order.
4. Calls `computeNormalizationParams(allCsvRows, endpoint)`: computes min/max for each metric (HR, selogHR, AE, EASE, G-Index, # patients) across the **entire** CSV (not filtered). Some metrics are reversed (lower=better: HR, selogHR, AE, EASE).
5. **Top 4 paths**: Default sort by `sucra` (descending). `updateDisplayedTop4()` takes first 4 from sorted `AllPathwaysResult`.
6. **Virtual scrolling table**: Full pathway list uses PrimeVue's `virtualScrollerOptions` with lazy loading (`loadPathwaysLazy`). Placeholder objects fill the virtual array; real data is loaded in chunks as user scrolls.
7. **Sorting**: User can sort by any column (HR, AE, # patients, EASE, G-Index, selogHR). `getSortedData()` re-sorts `AllPathwaysResult`. Default (SUCRA) sorts descending; column sorts respect `sortOrder`. Sort changes reset the virtual array and reload.
8. **Origami plots (radar charts)**: Top 4 paths rendered as Chart.js radar charts. Values are normalized to [0.4, 1.0] range via `normalizeRangeValue()` — maps [min, max] → [0.4, 1.0] with optional reversal. Chart labels alternate between metric names and empty strings (gap spacers for visual separation).
9. **Row selection interaction**: Selecting a row in the top paths table highlights corresponding criteria rows in the left-panel criteria table via `criteriaIndices` → `selectedCriteriaPath` → `criteriaRowClass`.

## State Restoration

When user clicks "Return to Selection" in ResultView:
- Emits `returnToSelection` with `{ step: '4' }` to Main.vue.
- Main.vue increments `stepViewKey` to force StepView remount, passes `initialStep='4'` and the previous `resultPayload` as `initialData`.
- StepView's `restoreState()` re-derives all intermediate data (treatment list, criteria, etc.) from the saved selections, then jumps to step 4.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/main.yml`) which builds and deploys to GitHub Pages automatically. The Vite `base` is hardcoded to `/TrialMap/` in `vite.config.js`.
