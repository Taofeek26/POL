# AppHeader

The green app bar: POL wordmark and the main sections, sticky at the top of every screen.

Use once per page, outside the content column. Pass `links` ({label, href}) and `current` (the label of the page you are on, which gets the underline). Slot the account control as `children`. On phones the nav scrolls sideways rather than wrapping.

- Do keep the link set to the app's real sections: My Leaders, Feed, Rankings, Compare, Method.
- Don't put a second colour in the bar; it is `header` with `on-header` only.

Hand-written from apps/web/app/layout.tsx.
