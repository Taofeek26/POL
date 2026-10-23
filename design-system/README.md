# POL design system

The source of truth for how the POL web app looks. Edit the app to match this folder, not the other way round.

- `tokens.json`: every colour (light and dark), type style, spacing, radius, shadow and size, each with a usage note.
- `tokens.css`: the same tokens as CSS custom properties (`--green`, `--ink`, `--space-4`, …). Light is `:root`; dark is `[data-theme="dark"]`. Use these names in `apps/web/app/globals.css` instead of literal values.
- `components/<Name>/README.md`: what each component is for and its props; `components/index.d.ts` has the prop types.
- `components/bundle.css` and `components/bundle.js`: a reference implementation of the components (plain React 18, class names prefixed `pol-`). Port the markup and styles into `apps/web/components/`; keep data fetching in the app.
- `components/<Name>/preview.html`: what each component should look like.
- Live, editable version: https://claude.ai/artifact/69uzBAuBMJH78FuUZv8Sf8

POL is a fact-based public scorecard for every elected and appointed office in Nigeria, from ward councillor to President. The design has one job: make a record easy to read and hard to mistake for opinion. Green and white, plain type, numbers first.

## Principles that shape the UI

- **Facts and opinion never share a component.** The Performance Score (`PerformanceScore`) and Citizen Approval (`ApprovalBar`) sit side by side, never merged, never on the same scale or colour.
- **Every number shows what it rests on.** A score carries its confidence; approval carries its count of verified residents; a news item carries its claim label (`ConfidencePill`) and source count. Below the threshold, say "Insufficient data", never a number.
- **Built for Aisha.** If it doesn't work on a ₦70,000 Android phone on 3G, it doesn't ship: system fonts only (no web-font download), 44px tap targets (`tap-target`), text before images.
- **Equal treatment.** Party is a neutral `Tag`. Never tint a profile, card or chart with a party's colours.

## Voice

Neutral, plain and checkable, the way a good clerk writes. Short sentences, sentence case, no exclamation marks, no adjectives that judge ("great", "failed"). Name the claim and its source: *"Zaria Road resurfacing completed, residents confirm"*, not *"Governor delivers!"*. Opinion is labelled as opinion: *"Opinion of POL users, not a poll."* Address the reader as "you" and their officials as "your leaders". Write for translation: English, Pidgin, Hausa, Yoruba and Igbo all ship, so avoid idioms and wordplay.

Product terms are capitalised as names: Performance Score, Citizen Approval, My Leaders, Right of reply.

## Colour

Green and white. The green is the Nigerian flag green, `green` (#008751), which belongs to the country rather than a party; white (`surface`) carries the content.

- Page ground is `page`; cards and controls are `surface` with a `line` border. Quiet fills inside a card are `surface-sunken`.
- Text is `ink`; secondary text `ink-muted`. Links and green headings are `green-deep`, never `green` (which is a fill).
- Fill with `green` for the one primary action per view and the brand mark; put `on-green` on it, never literal white (dark mode's green wants dark text).
- The app bar is `header` with `on-header`.
- Selected and hover states use `green-tint`.
- Citizen Approval is `approve` (dark green) against `disapprove` (light orange) on `bar-track`. They differ in lightness by 3:1 so the split reads in greyscale and for colour-blind readers, and both always carry 👍/👎 and a percentage.
- Claim labels each have their own colour, glyph and word: `status-announced` (hollow circle), `status-reported` (half circle), `status-verified` (check), `status-disputed` (triangle). Errors also use `status-disputed`.
- Keep red out of the main palette: with the green and white it reads as a party flag.

Every text pair meets 4.5:1 in both themes; controls, the focus ring and bar segments meet 3:1.

## Type

One family, `sans`: the phone's own system UI face. No custom font to download.

- `heading-1` once per screen, `heading-2` for sections (in `green-deep`), `heading-3` for card titles and headlines.
- `body` for summaries and form values, `body-sm` for office titles and meta rows, `caption` for footnotes under scores.
- Numbers: `score` for the Performance Score, always in `ink`. `overline` (uppercase, `ink-muted`) labels a number or a table column.
- `wordmark` is the POL name in the app bar.

## Space, shape, depth

- A 4px base: `space-1` … `space-12`. Cards pad `space-4` on phones, `space-5` from 640px. Cards in a list sit `space-3` apart.
- Corners: `radius-lg` for cards and banners, `radius-md` for buttons and inputs, `radius-sm` for tags, `radius-pill` for claim pills, avatars and the approval bar.
- Depth is a border first: `line` on every card, plus a faint `shadow-card`. The sticky app bar gets `shadow-bar`.
- Main content is one column, at most `content-width` wide, with a `space-4` gutter on phones.

## States

- Focus: a 2px solid `focus-ring` at 2px offset on every control.
- Pressed toggles (reactions, Approve/Disapprove): `green-tint` fill, `green-deep` border and label, `aria-pressed`.
- Disabled: 45% opacity, no hover.
- Low sample: the approval bar fades to 40% and says "too few to be reliable".

## Iconography

- Reactions use the blueprint's emoji: 👍 Good work, 👎 Bad / not enough, ⭐ Impactful, ⚠️ Disputed, 🔍 Show evidence. Always with a word or a count.
- Claim labels use four small drawn glyphs (in `ConfidencePill`), not emoji dots, so they look the same on every phone.
- People appear as initials on `green-tint` (`avatar`, `avatar-lg`) until a verified photo exists.
- There is no logo yet: set "POL" in `wordmark` with the small dot, and register the real mark before launch (blueprint 11).

## Components

`window.POL` (React 18): `AppHeader`, `Banner`, `Button`, `Tag`, `ConfidencePill`, `PerformanceScore`, `ApprovalBar`, `LeaderCard`, `NewsCard`, `ReactionBar`, `Field`. Each takes plain data; fetching, auth and saving stay in the app.

## Not synced

From Taofeek26/POL `mvp-foundation`: the app shipped a neutral blue palette (`--accent: #1f4e79`), replaced here by green and white on request. Component behaviour was hand-written as presentational React from `apps/web` (not built from the repository): `DevUserSwitcher`, `OfficialSearch` and `RateOfficial` have no card, and the page layouts (profile, rankings tables, compare, editor) are not components here. No font files, logos or icons exist in the repository.
