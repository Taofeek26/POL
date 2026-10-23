# ApprovalBar

Citizen Approval: the approve/disapprove split from verified residents, kept apart from the Performance Score.

Pass `pct` (approve %, or null), `residents` and `low` (too few to be reliable, which fades the bar). Approve is dark green, disapprove light orange: they differ in lightness, and both carry 👍/👎 and a number.

- Do always show the resident count under it.
- Don't merge it into the Performance Score.

Hand-written from `ApprovalBar` in apps/web/components/Score.tsx.
