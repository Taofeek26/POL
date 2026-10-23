/* @ds-bundle: {"format":4,"namespace":"POL","components":[{"name":"AppHeader"},{"name":"Banner"},{"name":"Button"},{"name":"Tag"},{"name":"ConfidencePill"},{"name":"PerformanceScore"},{"name":"ApprovalBar"},{"name":"LeaderCard"},{"name":"NewsCard"},{"name":"ReactionBar"},{"name":"Field"}]} */
(function () {
  var React = window.React, h = React.createElement, useState = React.useState;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }

  function AppHeader(p) {
    var links = p.links || [
      { label: "My Leaders", href: "#" }, { label: "Feed", href: "#" }, { label: "Rankings", href: "#" },
      { label: "Compare", href: "#" }, { label: "Method", href: "#" }
    ];
    return h("header", { className: "pol pol-header" },
      h("div", { className: "pol-header__in" },
        h("a", { className: "pol-wordmark", href: p.homeHref || "#" }, h("span", { className: "pol-wordmark__dot", "aria-hidden": true }), "POL"),
        h("nav", { className: "pol-nav", "aria-label": "Main" }, links.map(function (l) {
          return h("a", { key: l.label, href: l.href, "aria-current": l.label === p.current ? "page" : undefined }, l.label);
        })),
        p.children));
  }

  function Banner(p) {
    return h("div", { className: "pol pol-banner", role: "note" }, h("span", { className: "pol-banner__mark", "aria-hidden": true }), h("div", null, p.children));
  }

  function Button(p) {
    var v = p.variant || "secondary";
    return h("button", {
      type: p.type || "button", className: cx("pol-btn", v !== "secondary" && "pol-btn--" + v, p.size === "sm" && "pol-btn--sm"),
      "aria-pressed": p.pressed === undefined ? undefined : !!p.pressed, disabled: p.disabled, onClick: p.onClick, title: p.title
    }, p.children);
  }

  function Tag(p) { return h("span", { className: "pol-tag" }, p.children); }

  var GLYPH = {
    announced: h("svg", { viewBox: "0 0 12 12", "aria-hidden": true }, h("circle", { cx: 6, cy: 6, r: 4.25, fill: "none", stroke: "currentColor", strokeWidth: 1.5 })),
    reported: h("svg", { viewBox: "0 0 12 12", "aria-hidden": true }, h("circle", { cx: 6, cy: 6, r: 4.25, fill: "none", stroke: "currentColor", strokeWidth: 1.5 }), h("path", { d: "M6 1.75a4.25 4.25 0 0 1 0 8.5z", fill: "currentColor" })),
    verified: h("svg", { viewBox: "0 0 12 12", "aria-hidden": true }, h("circle", { cx: 6, cy: 6, r: 5, fill: "currentColor" }), h("path", { d: "M3.6 6.2l1.7 1.6 3.1-3.4", fill: "none", stroke: "var(--surface)", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" })),
    disputed: h("svg", { viewBox: "0 0 12 12", "aria-hidden": true }, h("path", { d: "M6 1.2l5 9.3H1z", fill: "currentColor" }), h("path", { d: "M6 4.6v2.6M6 8.7v.1", stroke: "var(--surface)", strokeWidth: 1.4, strokeLinecap: "round" }))
  };
  var LABEL = { announced: "Announced", reported: "Reported", verified: "Verified on ground", disputed: "Disputed" };
  function ConfidencePill(p) {
    var l = p.label || "reported";
    return h("span", { className: "pol-pill pol-pill--" + l }, GLYPH[l], LABEL[l]);
  }

  var CONF = { high: 3, medium: 2, low: 1 };
  function PerformanceScore(p) {
    if (p.value == null || p.confidence === "insufficient") {
      return h("div", { className: "pol pol-perf pol-perf--none", title: "Not enough verified data to give a number yet" },
        h("div", { className: "pol-perf__num" }, "Insufficient data"), h("div", { className: "pol-perf__lbl" }, "Performance"));
    }
    var n = CONF[p.confidence] || 0;
    return h("div", { className: "pol pol-perf" },
      h("div", { className: "pol-perf__num" }, Math.round(p.value), h("small", null, "/100")),
      h("div", { className: "pol-perf__lbl" }, "Performance"),
      h("div", { className: "pol-perf__conf" },
        h("span", { className: "pol-dots", "aria-hidden": true }, [1, 2, 3].map(function (i) { return h("i", { key: i, className: i <= n ? "on" : "" }); })),
        (p.confidence.charAt(0).toUpperCase() + p.confidence.slice(1)) + " confidence"));
  }

  function ApprovalBar(p) {
    if (p.pct == null) {
      return h("div", { className: "pol pol-approval pol-approval--low" }, h("div", { className: "pol-approval__bar", "aria-hidden": true }),
        h("div", { className: "pol-approval__note" }, "No verified ratings yet"));
    }
    var up = Math.round(p.pct), down = 100 - up, r = p.residents || 0;
    return h("div", { className: cx("pol pol-approval", p.low && "pol-approval--low"), "aria-label": "Citizen approval " + up + "% approve, " + down + "% disapprove" },
      h("div", { className: "pol-approval__bar", "aria-hidden": true },
        up > 0 ? h("div", { className: "pol-approval__up", style: { width: up + "%" } }) : null,
        down > 0 ? h("div", { className: "pol-approval__down", style: { width: down + "%" } }) : null),
      h("div", { className: "pol-approval__legend" }, h("span", null, "👍 " + up + "% approve"), h("span", null, "👎 " + down + "% disapprove")),
      h("div", { className: "pol-approval__note" }, r.toLocaleString() + " verified resident" + (r === 1 ? "" : "s") + (p.low ? " · too few to be reliable" : "")));
  }

  function initials(name) { return (name || "").split(" ").map(function (s) { return s.charAt(0); }).slice(0, 2).join(""); }
  function LeaderCard(p) {
    return h("article", { className: "pol pol-card" },
      h("div", { className: "pol-leader__head" },
        h("div", { className: "pol-avatar", "aria-hidden": true }, initials(p.name)),
        h("div", null,
          h("div", { className: "pol-leader__name" }, h("a", { href: p.href || "#" }, p.name), p.party ? h(Tag, null, p.party) : null),
          h("div", { className: "pol-leader__office" }, p.officeTitle),
          p.inOffice ? h("div", { className: "pol-leader__office" }, "In office " + p.inOffice) : null)),
      h("div", { className: "pol-leader__scores" },
        h(PerformanceScore, { value: p.performance, confidence: p.confidence }),
        h(ApprovalBar, { pct: p.approvePct, residents: p.verifiedResidents, low: p.lowSample })));
  }

  var REACTIONS = [
    { type: "up", label: "👍", title: "Good work" },
    { type: "down", label: "👎", title: "Bad / not enough" },
    { type: "impactful", label: "⭐ Impactful", title: "This changed my community" },
    { type: "disputed", label: "⚠️ Disputed", title: "This claim is false or exaggerated" },
    { type: "evidence", label: "🔍 Show evidence", title: "I want proof" }
  ];
  function ReactionBar(p) {
    var s1 = useState(p.counts || {}), counts = s1[0], setCounts = s1[1];
    var s2 = useState(p.mine || []), mine = s2[0], setMine = s2[1];
    function toggle(t) {
      var on = mine.indexOf(t) >= 0, c = Object.assign({}, counts);
      c[t] = (c[t] || 0) + (on ? -1 : 1);
      setCounts(c);
      setMine(on ? mine.filter(function (x) { return x !== t; }) : mine.concat([t]));
      if (p.onToggle) p.onToggle(t, !on);
    }
    return h("div", { className: "pol pol-reactions" }, REACTIONS.map(function (r) {
      return h(Button, { key: r.type, size: "sm", title: r.title, pressed: mine.indexOf(r.type) >= 0, onClick: function () { toggle(r.type); } },
        r.label, h("b", null, counts[r.type] || 0));
    }));
  }

  function NewsCard(p) {
    var officials = p.officials || [], n = p.sourceCount || 0;
    return h("article", { className: "pol pol-card" },
      h("div", { className: "pol-meta" }, h(ConfidencePill, { label: p.confidenceLabel }), p.topic ? h(Tag, null, p.topic) : null, p.date ? h("span", null, p.date) : null),
      h("h3", { className: "pol-news__title" }, h("a", { href: p.href || "#" }, p.headline)),
      h("p", { className: "pol-news__summary" }, p.summary),
      h("div", { className: "pol-meta" },
        officials.map(function (o) { return h("a", { key: o.name, href: o.href || "#" }, o.name); }),
        h("span", null, "· " + n + " source" + (n === 1 ? "" : "s")),
        p.aiGenerated ? h("span", null, "· summary auto-generated") : null),
      p.reactions === false ? null : h(ReactionBar, { counts: p.reactionCounts, mine: p.mine }));
  }

  function Field(p) {
    var id = p.id || ("f-" + String(p.label).toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    var control = p.options
      ? h("select", { id: id, value: p.value, defaultValue: p.value === undefined ? "" : undefined, disabled: p.disabled, onChange: p.onChange },
          [h("option", { key: "", value: "" }, p.placeholder || "Choose…")].concat(p.options.map(function (o) { return h("option", { key: o.value || o, value: o.value || o }, o.label || o); })))
      : h("input", { id: id, value: p.value, defaultValue: p.value === undefined ? p.defaultValue : undefined, placeholder: p.placeholder, disabled: p.disabled, onChange: p.onChange });
    return h("div", { className: "pol pol-field" }, h("label", { htmlFor: id }, p.label), control,
      p.error ? h("div", { className: "pol-field__error" }, p.error) : p.hint ? h("div", { className: "pol-field__hint" }, p.hint) : null);
  }

  window.POL = { AppHeader: AppHeader, Banner: Banner, Button: Button, Tag: Tag, ConfidencePill: ConfidencePill, PerformanceScore: PerformanceScore,
    ApprovalBar: ApprovalBar, LeaderCard: LeaderCard, NewsCard: NewsCard, ReactionBar: ReactionBar, Field: Field };
})();
