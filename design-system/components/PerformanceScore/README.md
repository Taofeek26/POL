# PerformanceScore

The 0–100 Performance Score with its confidence level, built from checkable facts.

Pass `value` (or null) and `confidence`. Below enough data it says "Insufficient data" instead of a number (blueprint 8.1, rule 2). The number is always `ink`, never green/red: the score is not a verdict.

Hand-written from `PerformanceScore` in apps/web/components/Score.tsx (confidence dots added).
