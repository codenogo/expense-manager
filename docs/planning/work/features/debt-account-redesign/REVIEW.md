# Review Report

**Timestamp:** 2026-03-01T20:41:42Z
**Branch:** feature/debt-account-redesign
**Feature:** debt-account-redesign

## Automated Checks (Package-Aware)

- Lint: **pass**
- Types: **fail**
- Tests: **pass**
- Invariants: **0 fail / 1 warn**
- Token savings: **134 tokens** (55.6%, 3 checks)

## Per-Package Results

### limohome (`.`)
- lint: **pass** (`npm run -s lint`, cwd `.`)
  - tokenTelemetry: in=0 out=0 saved=0 (0.0%)
- typecheck: **fail** (`npx tsc --noEmit`, cwd `.`)
  - tokenTelemetry: in=72 out=85 saved=0 (0.0%)
- test: **pass** (`npm test --silent`, cwd `.`)
  - tokenTelemetry: in=169 out=35 saved=134 (79.3%)

### .next (`.next`)
- lint: **skipped**
- typecheck: **skipped**
- test: **skipped**

### build (`.next/build`)
- lint: **skipped**
- typecheck: **skipped**
- test: **skipped**

### dev (`.next/dev`)
- lint: **skipped**
- typecheck: **skipped**
- test: **skipped**

### build (`.next/dev/build`)
- lint: **skipped**
- typecheck: **skipped**
- test: **skipped**

## Invariant Findings

- [warn] `src/components/layout/desktop-header.tsx:17` Line length 158 exceeds 140. (max-line-length)

## Verdict

**FAIL**

## Manual Review

> Review criteria: see `.claude/skills/code-review.md`
>
> Fill stage reviews in order: `stageReviews[0]=spec-compliance`, then `stageReviews[1]=code-quality`.
>
> Fill `securityFindings[]`, `performanceFindings[]`, `patternCompliance[]` in REVIEW.json.
