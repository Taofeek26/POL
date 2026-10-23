# Button

Buttons in three variants: primary (green fill), secondary (white with a strong edge) and ghost.

One primary per view ("Show my leaders", "Submit verification"). Pass `pressed` for toggles such as Approve/Disapprove; it sets `aria-pressed` and the green-tint selected look. `size="sm"` (40px) is for dense rows of reactions; everything else is 44px (`tap-target`).

- Do write verbs in sentence case.
- Don't colour a button by party or by good/bad.

Hand-written from `button`, `button.primary`, `button.on` in apps/web/app/globals.css.
