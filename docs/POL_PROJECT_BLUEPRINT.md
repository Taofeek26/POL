---
title: "POL — Project Blueprint"
subtitle: "A fact-based public scorecard for every elected and appointed office in Nigeria, from ward councillor to President"
date: "October 2026 · Version 1.0"
---

# 0. How to read this document

This blueprint covers the whole project, from the idea to a sustainable company. It is written so a founder, a developer, an investor, a grant officer or a lawyer can each find their section.

| If you are… | Read first |
|---|---|
| The founder | 1, 2, 4, 13, 15, 16 |
| A developer | 6, 7, 8, 9 |
| An editor or researcher | 5, 6, 10 |
| A lawyer or adviser | 11, 12 |
| An investor or funder | 1, 3, 14, 15, 17 |

**Working name:** *POL*, short for "Public Officials Ledger". Treat it as a placeholder until a name and trademark search is done (see 13.1).

**Important caveats.** Laws, platform rules, API prices, exchange rates and election dates change. Every figure marked **[verify]** must be checked against the official source before you act on it. All money figures are planning estimates, not quotes. None of this is legal advice: hire a Nigerian lawyer before launch (see 11).

---

# 1. Executive summary

**The problem.** Most Nigerians cannot easily find out what their elected and appointed officials have actually done. Information is scattered across press releases, partisan social media, newspapers and budget documents nobody reads. Election choices are therefore driven by party, ethnicity, religion, money and hearsay more than by record. At local level (LGA chairmen, councillors, state assembly members) there is almost no public record at all.

**The product.** POL is a mobile app, website and set of social media channels that:

1. Lists **every political office** in Nigeria (federal, state, LGA, ward) and who holds it.
2. Pulls in **verified news and official data** about what each office holder has done, and attaches each item to the right person.
3. Lets **citizens react** to each item: thumbs up/down, plus "this is impactful", "this claim is false" and "show me evidence". Ordinary users **cannot write posts**. They can only react and comment on curated items.
4. Shows **two separate scores** for every official:
   - **Performance Score (0–100):** based on facts that can be checked (projects confirmed on the ground, budget performance, bills, attendance, promises kept).
   - **Citizen Approval bar:** based on reactions, weighted so that verified residents count most and bots count for nothing.
5. Publishes **scorecards and rankings** on X, Facebook, Instagram, TikTok, YouTube and WhatsApp Channels, which drives traffic and revenue.

**Why two scores instead of one.** If reactions alone decide the score, it measures popularity and party loyalty, not performance. Paid online teams and bots will capture it within weeks, and the platform will lose the trust it depends on. Keeping facts and opinion separate is the single most important design decision in this document.

**How it makes money** (detailed in 14): advertising and social media monetisation from traffic; a paid **POL Pro** data service for media, researchers, embassies, banks and risk analysts; licensing scorecards to TV and radio during elections; grants from civic-tech and democracy funders; and optional premium memberships. POL will **never** take money from politicians or parties to change, hide or promote a score.

**Timing.** Nigeria's next general elections are due in early 2027 **[verify INEC's final timetable]**, so the campaign season is running now. That gives a two-stage plan (detailed in 15):

- **Stage A, "Election Sprint" (now until the elections):** a lean product with fact sheets and records for incumbents and leading candidates, focused on Presidency, governors, Senate and House of Representatives.
- **Stage B, "Day-One Tracking" (from inauguration, 29 May 2027):** the full platform starts every new term's clock on day one, so by 2031 there will be a complete four-year record of every office holder. This is the real long-term value.

---

# 2. The problem in detail

## 2.1 What citizens face today

- **No single place** lists who holds which office, especially below state level.
- **Official claims cannot be verified.** Projects are announced, "flagged off" or commissioned for photos, then abandoned. Citizens have no easy way to check.
- **Social media is partisan.** Supporters and opponents of every politician run organised online teams. Truth gets drowned out.
- **Budget data exists but is unreadable** for most people (PDF budgets, Open Treasury payment records, audit reports).
- **Local government is a black hole.** The 774 LGAs receive large federal allocations but publish little about how it is spent.
- **Voters decide on hearsay** because nothing better is available.

## 2.2 Who has tried parts of this (learn from them, partner where possible)

| Organisation | What they do | Lesson for POL |
|---|---|---|
| BudgIT / Tracka | Budget transparency; Tracka tracks constituency projects | Field verification works; partner on project data |
| OrderPaper Nigeria | Tracks National Assembly bills, votes and legislators | Good federal legislative data; possible data partner |
| Yiaga Africa | Election observation, governance research | Credible neutral partner for election-season content |
| Dataphyte, Premium Times (PTCIJ), TheCable, Daily Trust, etc. | Data journalism and fact-checking | Source and verification partners |
| Africa Check, Dubawa, FactCheckHub | Fact-checking | Partners for the "this claim is false" workflow |

**[verify]** each organisation's current programmes before reaching out. POL should present itself as **the citizen-facing layer that brings their work together and spreads it widely**, not as a competitor. That makes partnerships, data sharing and grants much easier.

## 2.3 What makes POL different

1. **Every level, every state**, all the way down to ward councillors.
2. **A consumer app with a feed**, not a report or dashboard. It is built for everyday phones and everyday attention.
3. **A transparent scoring method** that anyone can inspect.
4. **Citizen verification of projects** with geotagged photos.
5. **Distribution through social media handles**, so the scores reach people who will never install an app.

---

# 3. Vision, mission and principles

**Vision:** Every Nigerian votes on the record, not on rumour.

**Mission:** Make the performance of every public office holder in Nigeria visible, verifiable and easy to understand.

**Non-negotiable principles.** Publish these on the website. They are both your brand and your legal protection.

1. **Non-partisan.** No party, candidate or government pays to influence content or scores. Ever.
2. **Facts first.** Every performance claim links to a source. Opinion is always labelled as opinion.
3. **Transparent method.** The scoring formula is public and versioned. Any change is announced.
4. **Right of reply.** Every official can respond to any item about them, and the response is shown next to it.
5. **Corrections in public.** Mistakes are corrected openly with a visible correction note.
6. **Citizen privacy.** No selling personal data. Users can react without their identity being public.
7. **Equal treatment.** The same rules apply to the ruling party and the opposition, the North and the South, men and women.

---

# 4. Users and their needs

| User | Need | What POL gives them |
|---|---|---|
| Ordinary voter (18–45, mobile-first, Android) | "Who is my councillor? Did my governor do anything?" | Location-based "My Leaders" page, simple scores, short news |
| Young first-time voter | Shareable, easy-to-read content | Social cards, short videos, rankings |
| Diaspora Nigerian | Follow their home state | State and LGA following, newsletters |
| Journalist | Fast, sourced facts | Searchable records, embeddable widgets, POL Pro |
| Civil society organisation / NGO | Evidence for advocacy | Data exports, reports |
| Researcher / academic | Structured historical data | API, bulk datasets |
| Diplomat / development partner / risk analyst / investor | Governance quality by state | Pro dashboards, quarterly reports |
| Politician / office holder | Fair representation, right of reply | Verified official account to respond and submit evidence |
| Advertiser / brand | Reach engaged adult audience | Ad inventory, sponsored non-partisan voter education |

**Primary persona: "Aisha, 27, Kano."** Aisha has an Android phone with limited data, uses WhatsApp, X and TikTok, and speaks Hausa and English. She is not sure who represents her ward. **Design rule:** if it doesn't work for Aisha on a ₦70,000 phone on 3G, it doesn't ship.

---

# 5. Scope: every office POL tracks

## 5.1 Elected offices

| Level | Office | Approx. number | Phase |
|---|---|---|---|
| Federal | President, Vice President | 2 | A |
| Federal | Senators | 109 | A |
| Federal | Members, House of Representatives | 360 | A |
| State | Governors, Deputy Governors | 36 + 36 | A |
| State | Members, State Houses of Assembly | ~990 **[verify]** | B (pilot state first) |
| LGA | LGA / Area Council Chairmen (774, incl. 6 FCT Area Councils) | 774 | B (pilot state first) |
| Ward | Councillors | ~8,800 (≈ number of wards) **[verify]** | B (pilot state first) |

## 5.2 Appointed offices (Phase B onwards)

| Office | Approx. number |
|---|---|
| Federal Ministers & Ministers of State | ~45–50 |
| Heads of key federal agencies (FERMA, NDDC, REA, UBEC, etc.) | ~50 selected |
| State Commissioners | ~800–1,000 |
| FCT Minister | 1 |

## 5.3 Candidates (election periods)

During campaigns POL adds **candidate profiles**: background, past offices and their records, declared manifesto promises, debate attendance, and any court cases (public record only). Candidates are **never scored** before they hold office. They get a "record" panel only if they held a previous office.

## 5.4 Geography

- 36 states + FCT, 774 LGAs, ~8,809 wards **[verify current INEC ward count]**, 109 senatorial districts, 360 federal constituencies, state constituencies.
- Users are mapped to their leaders by **polling unit / ward**, chosen manually or detected from location with consent.

---

# 6. Product specification

## 6.1 Core screens

1. **Onboarding:** choose language → pick state → LGA → ward (or "use my location") → optional phone verification.
2. **My Leaders:** every office holder who represents the user, from councillor to President. Each shows a photo, party, time in office, Performance Score and Citizen Approval bar.
3. **Feed:** curated news items about the user's leaders first, then their state, then national. Filters: level, state, topic (roads, health, education, water, security, power, agriculture).
4. **Official Profile:**
   - Header: photo, office, party, term start/end, constituency map.
   - **Performance Score** with breakdown and a "how this is calculated" link.
   - **Citizen Approval bar** (green/red), with the count of verified residents behind it.
   - **Timeline** of news items, projects, bills and votes.
   - **Promises tracker:** kept / in progress / stalled / broken / not rated.
   - **Projects map:** pins with status and citizen photos.
   - **Right of reply** section.
5. **News Item:** headline, short neutral summary, source links, which officials it is linked to, a claim type (announcement / completed / verified on ground / disputed), reactions and comments.
6. **Project Page:** location, budget, contractor (if public), dates, status history, citizen photos, verification status.
7. **Compare:** two officials or candidates side by side.
8. **Rankings:** best and worst by office type, state and topic, with filters and the method explained.
9. **Verify a Project:** citizen submits a geotagged photo plus a status: exists and working / exists, not working / abandoned / never started / can't find it.
10. **Settings:** language, data saver, notifications, privacy, delete account.

## 6.2 Reactions (what users can and cannot do)

Users **cannot create posts**. On each item they can:

| Reaction | Meaning | Effect |
|---|---|---|
| 👍 Thumbs up | "Good work" | Counts toward Citizen Approval |
| 👎 Thumbs down | "Bad / not enough" | Counts toward Citizen Approval |
| ⭐ Impactful | "This changed my community" | Signals importance; surfaces the item; no score effect |
| ⚠️ Disputed | "This claim is false / exaggerated" | Sends the item to the verification queue if threshold reached |
| 🔍 Show evidence | "I want proof" | Increases priority for a field check |
| 💬 Comment | Text reply (moderated) | No score effect |

Using "Disputed" and "Show evidence" rather than only like/dislike turns the crowd into **fact-checkers**, not just cheerleaders.

## 6.3 Notifications

- New item about one of *my* leaders.
- A project near me needs verification.
- A promise status changed.
- Weekly "Your leaders this week" digest, which also goes out by WhatsApp and email.

## 6.4 Access for everyone

- **Languages:** English, Nigerian Pidgin, Hausa, Yoruba, Igbo (launch with English + Pidgin + one more; add the rest within 6 months).
- **Data-light:** app under 15 MB, compressed images, text-first mode, offline caching of My Leaders.
- **Lite web** (works on Opera Mini and KaiOS-class browsers).
- **WhatsApp bot:** "Who is my councillor?", "Send me my governor's score", weekly digest. WhatsApp reaches far more people than any app.
- **USSD / SMS (later phase):** look up an official's score with a short code, through a telco partner or aggregator.
- **Audio summaries** for low-literacy users (text-to-speech in local languages).
- Accessible design: large tap targets, screen-reader labels, colour-blind-safe bars (never only red/green, always with a number and an icon too).

## 6.5 Official accounts (for politicians)

- Office holders, or their verified staff, can claim their profile after identity and office verification.
- They can **post replies** and **submit evidence** (documents, photos, coordinates). Evidence enters the same verification queue as everything else. It does not appear as fact until checked.
- They **cannot** delete items, hide comments, buy placement or change their score.
- Every reply is labelled "Response from the office of …".

---

# 7. Data: sources, collection and verification

## 7.1 Data sources

| Category | Sources | How collected |
|---|---|---|
| Who holds office | INEC results and certificates of return, NASS website, State Assembly sites, State Independent Electoral Commissions (SIECs) for LGA polls, government gazettes, news | Researchers build the directory; crowdsourced corrections; quarterly audit |
| Legislative activity | NASS Votes & Proceedings, Order Papers, Hansards, bills database, OrderPaper (partner) | Scraping public pages where permitted, PDF parsing, partnerships |
| Budgets & spending | Budget Office of the Federation, Open Treasury portal, State budget documents, BudgIT (partner), Auditor-General reports | PDF/Excel parsing, manual entry for states |
| Procurement / contracts | Nigeria Open Contracting Portal (NOCOPO), BPP, state procurement portals | API or scraping where permitted |
| Projects | Official announcements, news, BudgIT Tracka, citizen reports, FOI requests | Pipeline in 7.2 |
| News | Licensed news APIs, publisher RSS feeds, partnerships with national and regional outlets, radio partners | RSS/API ingestion. **Summaries + links only, never full articles** |
| Official social media | Official X, Facebook, Instagram, YouTube accounts of governments and officials | Official platform APIs within their terms (see 12.4) |
| Promises | Campaign manifestos, inaugural speeches, debates, interviews | Researchers extract and log with source |
| Freedom of Information | FOI Act 2011 requests to ministries, agencies, states | Legal/research team; publish responses |

## 7.2 The news-to-official pipeline

```
[Sources] → Ingest → Clean & de-duplicate → AI classify & extract
         → Entity linking (which officials? which LGA? which project?)
         → Claim type (announced / contract awarded / completed / disputed)
         → Human editor review  ← required for anything that affects a score
         → Publish to feed → Citizen reactions & verification
         → Score engine (nightly)
```

**Step details:**

1. **Ingest** every 15 minutes from RSS, APIs and partner feeds. Store the URL, headline, publish time and outlet.
2. **De-duplicate:** ten outlets covering the same story become one item with ten source links. More sources = higher credibility.
3. **AI classification** (using a large language model such as Claude) suggests:
   - which officials and offices are involved,
   - location (state, LGA, ward, GPS if possible),
   - topic (roads, health…),
   - claim type,
   - a neutral 2–3 sentence summary in plain English, plus translations.
4. **Human review.** The AI only *suggests*. An editor confirms before the item can affect a score. Items that don't affect a score (general news) can auto-publish with a "summary auto-generated" label once accuracy is proven above 95% in testing.
5. **Confidence labels** on every item:
   - 🟡 **Announced:** the official or government says it.
   - 🔵 **Reported:** independent media confirms it.
   - 🟢 **Verified on ground:** POL field researcher, partner or ≥3 trusted citizen photos confirm it.
   - 🔴 **Disputed:** credible evidence contradicts the claim.
6. **Attribution rules.** Credit for a project goes to the office that funded and delivered it. Example: a federal road in Kano is credited to the Federal Ministry of Works and the President, not the governor, unless the state co-funded it. These rules are written down in the editorial handbook (10.3).

## 7.3 Citizen project verification

- A user submits a photo. The app captures GPS and timestamp **from the device at the moment of capture**, and gallery uploads are refused for verification. Photos are checked against the project location (within a set radius).
- **Trust levels:** a new user's report counts a little; users whose past reports were confirmed get more weight ("trusted verifier" badge).
- Image checks: reverse-image search for reused photos, metadata check, AI-generated image detection.
- **Status changes** require either ≥3 independent trusted reports or one POL field verification.
- **Safety:** users can submit anonymously, faces are blurred automatically, exact GPS is never shown publicly (only to roughly 100 m), and the app warns users never to take risks to get a photo.

## 7.4 Field network

- **State fellows:** one paid part-time researcher per state (start with the pilot state), often a journalism or political science graduate.
- **Partner networks:** universities, NYSC corps members (as volunteers in their own time, outside official duties), community radio, local CSOs.
- Each fellow verifies priority projects monthly and keeps the local directory up to date.

## 7.5 The data gap at LGA and ward level, and how to close it

This is the hardest part of the project. Plan for it:

1. Start with **one pilot state** and do it thoroughly.
2. Send **FOI requests** to each LGA for budgets and project lists. Publish when they respond, and also publish when they don't ("LGA X has not responded to a request sent 60 days ago" is itself information).
3. Use **SIEC results** and local news for who holds office.
4. **Crowdsource the directory** with moderation: "Is this your councillor? Suggest a correction."
5. Mark scores clearly as **"Insufficient data"** rather than guessing. An empty score is honest; a fake one destroys trust.

---

# 8. The scoring method

## 8.1 Design rules

1. Facts and opinion are **always separate**.
2. Every score shows **how much data** it rests on (a confidence level).
3. Officials are compared only with **others holding the same type of office**. A councillor is never ranked against a governor.
4. Score is **relative to the time served** ("since they took office").
5. The method is **public and versioned** (v1.0, v1.1, …) with a changelog.
6. An independent **Methodology Advisory Panel** (academics, statisticians, CSOs, a lawyer) reviews it every year.

## 8.2 Performance Score (0–100)

Built from components that depend on the type of office:

| Component | Executive (President, Governor, LGA Chair) | Legislator (Senator, Rep, State Assembly) | Councillor |
|---|---|---|---|
| Projects delivered & verified | 30% | 15% (constituency projects) | 35% |
| Budget performance & transparency | 20% | 10% | 15% |
| Promises kept | 20% | 15% | 15% |
| Legislative work (bills, motions, quality) | — | 25% | — |
| Attendance & participation | — | 15% | 10% |
| Outcome indicators (health, education, security data from official/independent sources) | 15% | — | — |
| Transparency & accountability (publishes budgets, answers FOI, audit findings) | 15% | 10% | 15% |
| Constituency engagement (town halls, accessible office) | — | 10% | 10% |

**[These weights are a starting proposal. The Advisory Panel must review them before launch.]**

**Project points example:**

- Each project gets points based on **value tier** (size of budget) × **status** × **verification level**.
- Status multipliers: completed and working 1.0; completed, not working 0.4; ongoing on schedule 0.5; stalled 0.1; abandoned −0.3; never started (but money released) −0.6.
- Verification multipliers: verified on ground 1.0; reported by independent media 0.7; announced only 0.3; disputed 0.
- Points are normalised against the **median of peers** in the same office type, so a component score of 50 means "average for this office".

**Confidence label:** High / Medium / Low / Insufficient data, based on the number of verified data points. With "Insufficient data", the number is hidden and only the raw record is shown.

## 8.3 Citizen Approval bar

Shown as a horizontal bar: **% approve vs % disapprove**, with the number of verified residents beneath it.

**Weighting:**

| Who reacted | Weight |
|---|---|
| Verified resident of the official's constituency | 1.0 |
| Verified Nigerian, not a resident of that constituency | 0.25 |
| Unverified account | 0 (shown separately as "unverified reactions", never counted) |
| Account flagged for coordinated behaviour | 0 |

**Further protections:**

- **One active rating per user per official**, which they can change at any time. Reactions on individual news items roll up into this rating rather than adding up endlessly. This stops someone from reacting 500 times on 500 items.
- **Time decay:** recent reactions count more (e.g. a 12-month half-life), so the bar reflects current opinion.
- **Smoothing for small numbers:** with few reactions, the bar is pulled toward 50/50 and greyed out until there are at least ~100 verified residents.
- **Brigading detection:** sudden spikes from new accounts, many accounts sharing devices or IP ranges, or identical comment text are automatically down-weighted and reviewed.
- The bar is **never** merged into the Performance Score. They are displayed side by side. The gap between the two is itself interesting ("high approval, low delivery" or the reverse).

## 8.4 Worked example (illustrative only)

> *Hon. A. B. (fictional), LGA Chairman, sample LGA, 18 months in office.*
>
> - Projects: 6 logged. 2 verified completed and working, 1 ongoing, 2 announced only, 1 abandoned → component 41/100
> - Budget: budget published, 48% capital implementation → 55/100
> - Promises: 12 tracked. 3 kept, 4 in progress, 5 not started → 38/100
> - Outcomes: insufficient data → weight redistributed to the other components
> - Transparency: answered 1 of 3 FOI requests → 33/100
>
> **Performance Score: 43/100 · Confidence: Medium**
> **Citizen Approval: 36% approve / 64% disapprove (1,240 verified residents)**

## 8.5 Score governance

- The score engine runs nightly. Every change is logged with its reason.
- An official can **appeal** a score component through a formal process with a 14-day response time. Outcomes are published.
- An annual **independent audit** of the method and a sample of scores, done by a university or statistics partner.

---

# 9. Technology

## 9.1 Recommended stack

The goal is low cost, quick to build, easy to hire for in Nigeria.

| Layer | Recommendation | Why |
|---|---|---|
| Mobile app | React Native (Expo), Android first | One codebase for Android & iOS; strong Nigerian developer pool |
| Web | Next.js (server-rendered for SEO), Lite mode | Search traffic is a main source of free visitors |
| API | Node.js (NestJS) or Python (FastAPI) | Common skills; good libraries |
| Database | PostgreSQL + PostGIS (maps) | Reliable, handles location queries |
| Search | OpenSearch / Meilisearch | Fast search of officials and news |
| Cache & queues | Redis + a job queue (BullMQ / Celery) | Ingestion, scoring jobs |
| Data pipeline | Python (scrapers, PDF parsing, scheduled jobs) | Best tools for document parsing |
| AI | A large language model API (e.g. Claude) for classification, extraction, summaries, translation; vision models for image checks | Speed. Always with human review |
| File storage | S3-compatible object storage + CDN | Photos, documents |
| Hosting | AWS (Cape Town / Lagos edge), Google Cloud, or a Nigerian-hosted provider for data held in Nigeria | See 11.2 on data protection |
| Security edge | Cloudflare (or similar) for CDN, DDoS protection, bot management, WAF | Political sites are frequent DDoS targets |
| Identity verification | Licensed Nigerian KYC providers for phone/NIN checks (e.g. Smile ID, Prembly, Dojah, VerifyMe; **[verify]**) | Never handle raw NIN data yourself if avoidable |
| Messaging | WhatsApp Business Platform, SMS aggregator, email (e.g. Amazon SES) | Digests and alerts |
| Analytics | Privacy-respecting product analytics (e.g. PostHog self-hosted) | No selling of user data |
| Monitoring | Sentry, uptime monitoring, log alerts | Reliability during traffic spikes |

## 9.2 Core data model (simplified)

```
Geography:   State → LGA → Ward → PollingUnit
             SenatorialDistrict, FederalConstituency, StateConstituency (map to LGAs/wards)

Office       (id, type, level, geography_id, title)
Person       (id, name, photo, bio, party_history, education, public_assets_declared?)
Tenure       (person_id, office_id, start_date, end_date, how_obtained: elected/appointed/court)
Promise      (tenure_id, text, source_url, date_made, category, status, status_history)
Project      (id, title, location_geo, budget_amount, funding_source, contractor,
              responsible_tenure_ids[], status, status_history, verification_level)
NewsItem     (id, summary, sources[], published_at, topic, claim_type,
              linked_tenures[], linked_projects[], confidence_label, editor_id)
Bill / Vote / Attendance  (for legislators)
Reaction     (user_id, target_type, target_id, type, created_at, weight_snapshot)
OfficialRating (user_id, tenure_id, value, updated_at)  ← one per user per official
CitizenReport (user_id, project_id, photo, gps, captured_at, status_claim, trust_score, review_status)
Score        (tenure_id, method_version, component_scores{}, total, confidence, computed_at)
User         (id, phone_hash, verification_level, home_ward_id, language, trust_score)
Reply        (tenure_id, target_id, text, evidence[], verified_official_account_id)
AuditLog     (who, what, before, after, when)
```

## 9.3 Key engineering requirements

- **Everything traceable:** every number on screen can be traced to its sources and the method version.
- **Audit log** of every editorial and score change, kept permanently.
- **Rate limits & anti-bot:** device fingerprinting, phone verification, CAPTCHA on suspicious behaviour, velocity checks.
- **Election-night scale:** load-test for 50× normal traffic; cache aggressively; degrade gracefully (read-only mode).
- **Offline-tolerant app:** queue reactions and reports when offline.
- **Accessibility & localisation** built in from day one (all strings translatable).
- **Security:** encryption in transit and at rest; least-privilege access for staff; two-factor login for all staff; regular penetration tests; bug bounty later.
- **Backups:** daily, tested restores, a copy held in a second region.
- **Censorship resilience:** a mirror domain plan and the ability to keep serving content if a domain is blocked (see risk R-04).

## 9.4 AI use: rules

1. AI suggests, humans decide anything that affects a score or names a wrongdoing.
2. All AI summaries are labelled.
3. Monthly accuracy sampling: an editor re-checks a random 5% of AI output. Pause automation if accuracy drops below the threshold.
4. Never use AI to generate images or video of real officials.
5. Prompt and model changes are logged, like method changes.

---

# 10. Content, editorial and moderation

## 10.1 Editorial team (initial)

- **Editor-in-chief:** final responsibility, experienced journalist, publicly named.
- **Data editors (2–3):** review pipeline items and projects.
- **Researchers/fellows:** directory, promises, field checks.
- **Community moderators (2+, rotating, covering all major languages):** comments and reports.

## 10.2 Moderation rules for comments

- **Allowed:** criticism and praise of officials' public conduct, strong opinion, evidence.
- **Removed:** hate speech (ethnic, religious, gender), threats or incitement to violence, unproven accusations of crimes against named individuals, doxxing (addresses, family members), spam, coordinated campaigns, fake news.
- **Tools:** AI pre-screening in all supported languages, user reporting, a three-strikes system, and shadow-limiting of coordinated accounts.
- **Election period:** stricter thresholds, faster response targets (under 1 hour for violence-related reports), and a direct line to fact-check partners.

## 10.3 Editorial handbook (write before launch)

Covers: the attribution rules, how to write neutral summaries, which words to avoid ("corrupt" is only used with a court judgment), how to handle disputed claims, the right-of-reply process (contact the office and wait 48 hours before publishing serious allegations), corrections policy, conflict-of-interest declarations for staff, election-period rules, and safety protocol for field staff.

## 10.4 Balance monitoring

Every month, publish a **balance report**: share of positive and negative items by party, region, gender and office level. If one party's officials get consistently harsher coverage, investigate whether that reflects the data or a bias in sourcing.

---

# 11. Legal and regulatory framework

> **Hire a Nigerian media and technology lawyer before launch.** This section lists issues to discuss with them. It is not legal advice.

## 11.1 Company setup

- Register with the **Corporate Affairs Commission (CAC)**. Recommended structure:
  - **POL Technologies Ltd** (company limited by shares): runs the app, ads and Pro subscriptions, and can raise investment.
  - Later, **POL Foundation** (company limited by guarantee / incorporated trustees): receives grants, owns the methodology and editorial independence, and sits on the Ltd's board or holds a "golden share" over editorial policy. Many funders can only give to non-profits.
- Tax registration (FIRS, state IRS), and VAT on subscriptions and ads.
- Register the **trademark** for the name and logo.
- Shareholder agreement with an **editorial independence clause**: investors cannot direct content or scores.
- Funding transparency: publish all funders above a threshold on the website.

## 11.2 Data protection: Nigeria Data Protection Act 2023 (NDPA)

- Register with and follow guidance from the **Nigeria Data Protection Commission (NDPC)**; appoint a Data Protection Officer; carry out data protection audits as required **[verify current thresholds]**.
- Political opinion is **sensitive personal data**. How each user reacts to politicians must be protected strictly:
  - Store reactions linked to pseudonymous IDs.
  - Never publish who reacted how.
  - Never sell or share individual reaction data, only aggregated statistics.
  - Publish aggregates only when groups are large enough that no one can be identified.
- Phone and NIN verification: use licensed KYC providers, store only a verification flag and a hashed phone number, never the NIN itself.
- Clear consent screens, a privacy policy in plain language and in local languages, and easy account deletion.
- Data held outside Nigeria: check cross-border transfer rules under the NDPA.

## 11.3 Defamation and publication risk

- Defamation can bring civil suits, and criminal defamation provisions also exist in Nigerian law **[verify with counsel]**. Politicians are known to sue and to petition the police.
- **Protections:**
  - Fact-based claims with sources; truth (justification) and fair comment on matters of public interest are the main defences.
  - Right-of-reply procedure, documented every time.
  - The "Disputed" label rather than stating claims as false without evidence.
  - Never call anyone corrupt or criminal without a court judgment or official finding (e.g. an Auditor-General query is reported as exactly that: a query).
  - Pre-publication legal review for high-risk items.
  - Comment moderation (POL can be exposed for user comments it hosts and fails to remove after notice).
  - **Media liability insurance** if obtainable **[verify availability in Nigeria]**.
  - A legal defence fund and a relationship with press freedom organisations (e.g. Media Rights Agenda).

## 11.4 Cybercrimes Act 2015 (as amended 2024)

- Its provisions on cyberstalking and false information have been used against journalists and online critics **[verify the current wording after the 2024 amendment]**.
- **Mitigation:** strict sourcing, no publishing of unverified allegations, fast takedown of harmful user comments, legal counsel on retainer, and documented editorial processes to show good faith.
- Prepare a **police / DSS contact protocol**: what staff do if invited for questioning (call counsel, never go alone, inform press freedom partners).

## 11.5 Electoral law

- **Electoral Act 2022:** respect the official campaign window and the ban on campaigning in the last 24 hours before polls **[verify]**. POL is not campaigning, but avoid any "vote for X" language.
- **Never present citizen approval as an opinion poll or election prediction.** Label it "Citizen Approval among POL users". It is not a scientific sample.
- Election-day content: only official INEC results (IReV) and accredited observer data (e.g. Yiaga Africa). No unofficial result tallies.
- Don't publish anything resembling a result before INEC announces it.

## 11.6 Copyright: Copyright Act 2022

- Never republish full articles or photos without a licence.
- Use **short headlines, your own summaries, and links** to the original.
- Seek **content partnerships** with publishers. POL sends them traffic, which is attractive to them.
- Officials' photos: use official government photos (check licence), take your own at public events, or get permission.

## 11.7 Other regulators and rules

- **NITDA** (IT and digital rules, including the code of practice for online platforms **[verify current status]**).
- **NCC** for SMS/USSD services through licensed aggregators.
- **ARCON** (Advertising Regulatory Council of Nigeria) on advertising rules, including political adverts **[verify]**.
- **Consumer protection (FCCPC)** for subscriptions.
- Platform rules: Google Play and Apple App Store policies on news and political content; WhatsApp Business policy.

## 11.8 Freedom of Information Act 2011

A legal tool for getting data. Build a routine FOI programme and publish every request and every response (or non-response).

---

# 12. Risk register

**L** = likelihood, **I** = impact (H/M/L).

## 12.1 Trust and integrity risks

| # | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R-01 | **Bots and paid online teams manipulate reactions** | H | H | Phone/ID verification; resident weighting; one rating per user per official; anomaly detection; unverified reactions shown separately; Performance Score not affected by reactions |
| R-02 | **Party, ethnic or religious bloc voting** distorts approval | H | M | Approval separated from Performance; residents weighted most; display sample size; explain clearly that approval is opinion |
| R-03 | **POL is seen as biased** toward a party or region | M | H | Published principles and method; monthly balance reports; diverse team and advisory panel; public funder list; same rules for all |
| R-05 | **Officials publish fake project claims** (PR as news) | H | H | Confidence labels; "Announced" scores low; ground verification needed for full points; "Disputed" workflow |
| R-06 | **AI misattributes a story** to the wrong official | M | H | Human review for anything that affects a score; accuracy sampling; fast correction process |
| R-07 | **Factual error** goes viral | M | H | Corrections policy; visible correction notes; social posts corrected with a reply/quote |
| R-08 | **Fake citizen photos** (old images, other locations, AI-generated) | M | M | In-app camera capture only; GPS/time checks; reverse-image search; trusted-verifier system; multiple confirmations required |
| R-09 | **Funder or investor tries to influence content** | M | H | Editorial independence clause; foundation oversight; funder diversity; refuse conditional money; public funder list |
| R-10 | **Insufficient local data** leads to empty or wrong local scores | H | M | Pilot state first; FOI programme; fellows; "Insufficient data" label instead of guessing |

## 12.2 Legal and political risks

| # | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R-04 | **Government blocks the site/app** or pressures platforms (as with the 2021 Twitter suspension) | L–M | H | Strict neutrality and legality; mirror domains; WhatsApp/SMS reach; international press freedom allies; content safe to defend in court |
| R-11 | **Defamation lawsuits** | H | M–H | Sourcing, right of reply, legal review, insurance, legal fund (11.3) |
| R-12 | **Arrest or harassment of staff** under cybercrime or other laws | M | H | Legal retainer; police contact protocol; press freedom partners; key staff known publicly (visibility protects them); legal entity and editor, not individual fellows, carry responsibility |
| R-13 | **Physical threats to field researchers or citizen verifiers** | M | H | Anonymous reporting; no faces/exact GPS published; safety training; no field work in high-risk areas during tense periods; insurance |
| R-14 | **Data protection breach or NDPA violation** | M | H | DPO; NDPA compliance programme; minimum data collection; encryption; breach response plan |
| R-15 | **Electoral law breach** (seen as campaigning or publishing "polls") | L | H | Clear labelling; election-period editorial rules; counsel review |
| R-16 | **Copyright claims from publishers** | M | M | Summaries + links only; licensing partnerships |
| R-17 | **App store removal** after complaints | L | H | Comply with store news/political content policies; strong moderation; web and WhatsApp as fallbacks |

## 12.3 Security risks

| # | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R-18 | **DDoS attacks** around elections or after critical stories | H | M | Cloudflare/CDN, rate limiting, caching, read-only fallback mode |
| R-19 | **Hacking / defacement / score tampering** | M | H | Security reviews; 2FA; least-privilege; audit logs; scores can be recomputed from source data; pen tests |
| R-20 | **Users' political views exposed** (leak, subpoena) | L | H | Pseudonymous storage, minimum retention, encryption, legal process policy, transparency report |
| R-21 | **Impersonation:** fake "POL" accounts posting fake scores | M | M | Verified handles on all platforms; scorecard images with QR code linking to the live page; report fakes quickly |
| R-22 | **Deepfakes about officials** spread on the feed | M | H | No user-generated media in the feed; fact-check partners; AI-detection tools for submissions |

## 12.4 Platform and data supply risks

| # | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R-23 | **Social platform API changes or costs** (X/Meta) | H | M | Don't depend on one source; RSS, publisher partnerships and official websites; budget for paid API tiers **[verify current pricing]** |
| R-24 | **Scraping blocked or prohibited** | M | M | Respect robots.txt and terms; prefer partnerships and FOI; data agreements |
| R-25 | **Internet shutdowns or poor connectivity** | M | M | Offline caching; SMS/USSD; radio partnerships |

## 12.5 Business risks

| # | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R-26 | **Advertisers avoid political content** (brand safety) | H | M | Contextual ads on non-controversial pages; sponsored voter education; diversify into Pro, licensing, grants |
| R-27 | **Low Nigerian ad rates (CPM)** mean little revenue from traffic | H | M | Traffic monetisation is only one stream; focus on Pro data and media licensing |
| R-28 | **Traffic spikes only at elections**, then drops | H | M | Day-to-day value: local news, "my leaders", project alerts, weekly digests, fiscal-year stories (budget season, allocations) |
| R-29 | **Running out of money** before revenue | M | H | Lean team; grant pipeline early; phased spending; 6 months of cash reserve |
| R-30 | **Naira exchange-rate swings** raise costs (cloud, APIs priced in USD) | H | M | Price some Pro deals in USD; keep USD reserves; optimise cloud costs |
| R-31 | **Copycat competitor** or politically funded fake "scorecard" apps | M | M | Move fast; credibility through partnerships and method; brand; data depth over time |
| R-32 | **Founder burnout / key-person risk** | M | H | Hire an editor-in-chief and tech lead early; document everything; board/advisers |
| R-33 | **Low engagement / users don't come back** | M | H | Location personalisation; notifications; WhatsApp digests; local news focus; game-like verifier badges |

## 12.6 Social harm risks

| # | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R-34 | **Comments fuel ethnic or religious hatred** | M | H | Strong moderation in all languages; AI pre-screening; comment-free mode for sensitive items; election-period strictness |
| R-35 | **Scores used to justify violence or harassment** against officials | L | H | No personal info beyond public office; condemn violence publicly; remove calls to harm immediately; cooperate lawfully with authorities |
| R-36 | **Exclusion** of rural, older, poorer and low-literacy citizens | H | M | WhatsApp, SMS, audio, local languages, radio partnerships, community ambassadors |
| R-37 | **Unfair to women and minority officials** (more abuse, less coverage) | M | M | Balance monitoring; harassment moderation; ensure their work is covered equally |

## 12.7 Crisis playbook (prepare before launch)

For each scenario, write down the owner, the first-hour actions and the communication template:

1. Major factual error goes viral.
2. Lawsuit or police invitation.
3. Site/app blocked or DDoS.
4. Data breach.
5. Staff member threatened.
6. Accusation of bias by a major party.
7. Fake POL account spreading false scores.

---

# 13. Brand, distribution and social media handles

## 13.1 Name and brand

- Check that the name is available at CAC, as a trademark, as domains (`.ng`, `.com.ng`, `.com`) and as handles on every platform before committing.
- Neutral colours. **Avoid party colours** (APC, PDP, LP, NNPP and other party branding) in the logo and main palette.
- Tagline ideas: "Vote the record." · "Facts, not hearsay." · "Know your leaders."

## 13.2 The POL social handles

These do two jobs: they inform people who never install the app, and they drive traffic and revenue.

| Platform | Content | Frequency |
|---|---|---|
| X | Scorecard cards, "promise kept/broken" posts, threads, live election coverage (official data only) | Daily, several posts |
| Facebook | Same cards plus longer explainers; state-level pages later | Daily |
| Instagram | Carousel scorecards, Reels | 4–7 / week |
| TikTok & YouTube Shorts | 30–60s "Did your governor deliver?" explainers; field verification videos | 3–5 / week |
| YouTube (long form) | Monthly state reviews, candidate record breakdowns, interviews | Weekly–monthly |
| WhatsApp Channel(s) | National + one per state: weekly digest, alerts | Weekly + breaking |
| Telegram (optional) | Mirror of WhatsApp | Weekly |
| Radio partnerships | Weekly "Scorecard" segment in local languages | Weekly |

## 13.3 Automated scorecard posting, done safely

The idea from your brief: a POL handle that automatically posts each person's score after analysis.

- The system **generates scorecard images automatically** from the latest scores: photo, office, Performance Score with confidence, Citizen Approval bar, top 3 facts, method version, date, and a **QR code / link** to the live page.
- **A human editor approves** every post before it goes out. Auto-generate, human-approve. Never fully automatic, because one wrong automatic post about a governor can cause a lawsuit or a crisis.
- Post formats:
  - "Monthly Scorecard: Governors" (top 5 / bottom 5, with method link).
  - "Promise Tracker update".
  - "Project check: verified vs announced".
  - "Most improved this quarter" (positive stories build trust with all sides).
  - "Your LGA chairman this month" (state accounts).
- **Rule:** every post links back to the website. That turns social reach into website traffic, and the website is where most ad and subscription revenue happens.
- Avoid low-confidence scores in rankings. Post only scores with Medium or High confidence.

## 13.4 Growth tactics

- **SEO:** a server-rendered public page for every official, LGA and project. People search for "who is the chairman of X LGA", and POL should be the top result.
- **Shareable cards** on every profile ("Share my councillor's scorecard").
- **Embeddable widgets** for newspapers and blogs.
- **Partnerships:** universities, student unions, NYSC CDS groups, faith-based and community groups (on a non-partisan basis), radio and TV.
- **Referral rewards:** verifier badges, leaderboards for top verifiers (no cash, to avoid fraud).
- **Election-season moments:** debate fact-checks, candidate comparison tools, "Before you vote" guides.
- **Influencer partnerships** with clearly non-partisan creators. Disclose any paid partnership.

---

# 14. Business model and revenue

## 14.1 Revenue principles

1. **Never sell** score changes, removals, hidden content, "featured" placement for politicians, or user data.
2. **No political adverts** at least during the first year. After that, only if the board approves a strict policy (clearly labelled, equal terms for all parties, no micro-targeting, public ad library).
3. Diversify. No single stream above 40% of revenue after year 2, so no single payer can pressure POL.

## 14.2 Revenue streams

| # | Stream | Who pays | How | When |
|---|---|---|---|---|
| 1 | **Display & video advertising** | Brands via ad networks (e.g. Google AdSense/Ad Manager) and direct sales | Ads on website and app; contextual targeting by topic, not by user politics | From launch (web) |
| 2 | **Social media monetisation** | Platforms | YouTube Partner Program, Facebook content monetisation, X creator revenue sharing, TikTok creator programmes **[verify eligibility for Nigeria and thresholds]** | After reaching thresholds |
| 3 | **Sponsored non-partisan content** | Banks, telcos, FMCG brands' CSR budgets, NGOs, development partners | Sponsored voter-education series, "Know your LGA" campaigns, clearly labelled | Months 3+ |
| 4 | **POL Pro (data subscription)** | Media houses, research firms, embassies, development agencies, banks, investors, consultancies, PR and risk firms | Dashboards, bulk exports, alerts, API, historical data; tiered subscriptions | Months 6+ |
| 5 | **Media licensing** | TV, radio and online news outlets | Licensed scorecards and graphics for election coverage; data partnerships | Election seasons + ongoing |
| 6 | **Grants & foundation funding** | Democracy, governance and civic-tech funders (e.g. Ford Foundation, Open Society/OSIWA, NED, MacArthur, EU and UK/US governance programmes; **[verify current priorities]**) | Project grants: field verification, local languages, FOI, election programmes | Apply from month 1 |
| 7 | **Research reports** | Institutions, corporates | Annual "State of Governance" index; quarterly state reports; custom research with strict independence rules | Year 1+ |
| 8 | **Premium membership** | Engaged citizens, diaspora | ₦500–₦1,500/month or USD diaspora pricing: ad-free, deeper reports, early access, PDF downloads | Year 1+ |
| 9 | **Events** | Sponsors, ticket buyers | Town halls, candidate debates (in partnership with neutral organisers), awards for "Most Improved LGA" with transparent criteria | Year 2+ |
| 10 | **Training & tools** | CSOs, journalists, universities | Data journalism training, white-label tracker tools for other African countries | Year 2+ |

**What NOT to sell, even when offered money:**

- "Reputation management" for politicians.
- Users' political views or targeting data.
- Early access to scores for campaigns.
- Exclusive data that lets one party gain an advantage.

POL Pro must be available to all parties on equal terms, or to none.

## 14.3 Revenue estimates (illustrative scenarios; recalculate with real data)

**Assumptions:** exchange rate ~₦1,500/USD **[verify]**; Nigerian display ad effective rates are low (roughly $0.20–$1.50 per 1,000 page views depending on format and season, **[verify with real ad network data]**); election seasons raise traffic several times over.

| Stream (Year 1, conservative) | Low | Mid | High |
|---|---|---|---|
| Ads (web + app) | $3k | $12k | $35k |
| Social monetisation | $1k | $6k | $20k |
| Sponsored content | $5k | $25k | $60k |
| POL Pro | $0 | $15k | $50k |
| Media licensing | $2k | $10k | $40k |
| Grants | $25k | $100k | $250k |
| **Total** | **~$36k** | **~$168k** | **~$455k** |

**By Year 3** (with 4 years of data building and every state covered), POL Pro, media licensing and research reports should become the main income. Grants should fall below 40% of revenue.

**The honest point:** traffic and posting alone will not pay for a team doing serious verification in a market with low ad rates. **Data products, licensing and grants** are what make the business sustainable. Traffic is what makes those valuable.

## 14.4 Key metrics (KPIs)

| Area | Metric | Year-1 target (ambitious but possible) |
|---|---|---|
| Reach | Monthly active users (app + web) | 500k (election months 2M+) |
| Reach | Social followers across platforms | 1M |
| Reach | WhatsApp channel subscribers | 200k |
| Depth | % users with home ward set | 60% |
| Depth | Verified users | 150k |
| Trust | Corrections per 1,000 items | < 2 |
| Trust | Balance report deviation by party | Within ±10% |
| Data | Officials with Medium+ confidence score | 100% federal; 100% pilot state |
| Data | Projects verified on ground | 1,000+ |
| Revenue | Paying Pro clients | 15–30 |
| Revenue | Revenue diversity (largest stream share) | < 60% Year 1, < 40% Year 3 |

---

# 15. Roadmap: from today to a national platform

Today is October 2026. The plan below fits the 2027 election season.

## Phase 0: Foundation (weeks 0–4)

- [ ] Confirm name; trademark, domains and social handles.
- [ ] Register the company with CAC; open a bank account.
- [ ] Engage a media/tech lawyer; draft privacy policy, terms, editorial principles.
- [ ] Recruit core team: tech lead, editor-in-chief, 2 data editors.
- [ ] Form the Methodology Advisory Panel (3–5 people).
- [ ] Approach 3–5 partners (data, fact-checking, media).
- [ ] Submit the first 2–3 grant applications.
- [ ] Set up the repository, cloud accounts, security basics.

## Phase A: Election Sprint (months 1–4, before the elections)

Goal: be useful **this** election, with a lean but credible product.

- [ ] Directory: President, VP, 36 governors and deputies, 109 senators, 360 reps, ministers.
- [ ] Candidate profiles for presidential and governorship candidates of the major parties.
- [ ] **Record panels** for incumbents seeking re-election: promises vs delivery, flagship projects, attendance and bills (legislators).
- [ ] Curated news feed (federal + state) with confidence labels.
- [ ] Reactions + Citizen Approval bar (with verification).
- [ ] Website (SEO-first) + Android app + WhatsApp channel.
- [ ] Scorecard generator + social handles live.
- [ ] Election-day: link to official INEC IReV results and accredited observer data only.
- [ ] Load testing, DDoS protection, crisis playbook.

*Performance Scores in Phase A:* publish only where data reaches Medium confidence. Otherwise show the record without a number. Better to be credible than complete.

## Phase B: Day-One Tracking (months 4–10, from inauguration)

- [ ] **Start every new term on 29 May 2027**: log inaugural promises within the first 2 weeks.
- [ ] **Pilot state, every level:** state assembly, LGA chairmen, councillors.
- [ ] Projects map + citizen verification.
- [ ] Promise tracker for all federal and pilot-state officials.
- [ ] iOS app; Pidgin + Hausa/Yoruba/Igbo.
- [ ] POL Pro beta for 5–10 launch clients.
- [ ] First quarterly State Governance Report.

## Phase C: National scale (months 10–24)

- [ ] Expand to 6 states (one per geopolitical zone), then all 36 + FCT.
- [ ] State fellows network.
- [ ] Commissioners and key agency heads.
- [ ] FOI programme at scale.
- [ ] Public API; embeddable widgets.
- [ ] Off-cycle governorship elections (e.g. Anambra, Edo, Ondo, Kogi, Bayelsa, Imo, Ekiti, Osun **[verify their dates]**): special coverage.
- [ ] Annual independent method audit.

## Phase D: Mature platform (years 2–4)

- [ ] Full four-year record for every office holder in time for the next general elections.
- [ ] USSD/SMS access; radio syndication.
- [ ] Annual "State of Governance" index and awards.
- [ ] Expansion of the model to other African democracies (Ghana, Kenya, etc.) as a white-label product.

---

# 16. Team and budget

## 16.1 Team plan

| Role | Phase A | Phase B | Phase C |
|---|---|---|---|
| Founder / CEO | 1 | 1 | 1 |
| Tech lead (full-stack) | 1 | 1 | 1 |
| Developers (mobile/web/data) | 1–2 | 3 | 5 |
| Editor-in-chief | 1 | 1 | 1 |
| Data editors / researchers | 2 | 4 | 8 |
| State fellows (part-time) | 0 | 1–3 | 37 |
| Community moderators | 1–2 | 3 | 6 |
| Social media / video producer | 1 | 2 | 3 |
| Partnerships & sales (Pro, sponsors) | founder | 1 | 2 |
| Legal (retainer) | ✓ | ✓ | ✓ |
| Data Protection Officer (can be outsourced) | ✓ | ✓ | ✓ |
| Advisory Panel (unpaid / honorarium) | 3–5 | 5 | 7 |

## 16.2 Budget estimates (monthly, Lagos/Abuja-based, mid-range; **[verify current salaries]**)

| Item | Phase A (₦/month) | Phase B (₦/month) |
|---|---|---|
| Salaries (team above) | 8–14M | 15–25M |
| State fellows | — | 0.5–1.5M |
| Cloud hosting, CDN, security | 0.5–1.5M | 1–3M |
| AI / API costs (LLM, KYC verification, news APIs, social APIs) | 0.5–2M | 1–4M |
| SMS / WhatsApp messaging | 0.2–0.8M | 0.5–2M |
| Legal retainer + compliance | 0.5–1.5M | 0.8–2M |
| Marketing & content production | 1–3M | 1.5–4M |
| Office, internet, power (incl. backup power), misc. | 0.5–1.5M | 1–2M |
| **Total monthly** | **~₦12–26M** | **~₦21–44M** |

**One-off setup costs:** company and trademark registration, legal drafting, equipment, design and branding, security audit. Estimate ₦5–15M.

**Budget for 12 months:** roughly ₦250M–₦500M (~$170k–$330k at ₦1,500/USD) **[estimate]**. A lean version (founder + 3–4 people, federal-only scope, volunteers) could start for a fraction of that.

## 16.3 Funding plan

1. **Pre-launch:** founder funds + small grants + friends & family, enough for Phase 0 and a lean Phase A.
2. **Phase A–B:** civic-tech / democracy grants (main funding) + early sponsorships.
3. **Phase B–C:** impact investors / angel round into POL Technologies Ltd, with the editorial independence clause. Pro and licensing revenue grow.
4. **Year 3+:** revenue covers most costs; grants fund expansion and public-good work.

---

# 17. Measuring social impact

Funders and the public will ask: "Does this actually help?" Track:

- **Voter knowledge:** surveys of users vs non-users on "Can you name your councillor / rep?"
- **Use in public life:** number of news stories, debates and parliamentary questions citing POL data.
- **Official responsiveness:** right-of-reply rate; number of officials publishing budgets and project lists after being scored.
- **Project outcomes:** abandoned projects restarted after POL coverage.
- **FOI compliance:** response rates over time.
- Partner with a university for an **independent impact evaluation** in Year 2.

---

# 18. Launch checklist

**Legal & governance**

- [ ] Company registered; trademark filed
- [ ] Lawyer engaged; terms, privacy policy, editorial principles published
- [ ] NDPA compliance: DPO, consent flows, data processing records
- [ ] Editorial handbook, corrections and right-of-reply policies
- [ ] Advisory Panel formed; method v1.0 reviewed and published
- [ ] Funder list page live

**Product & data**

- [ ] Federal & governor directory 100% complete and double-checked
- [ ] Ingestion pipeline running; editors trained
- [ ] Confidence labels and attribution rules applied
- [ ] Verification (phone/KYC) working; bot defences active
- [ ] Comment moderation tools and team in place, covering supported languages
- [ ] Scorecard generator + human approval flow

**Security & operations**

- [ ] CDN/DDoS protection, WAF, rate limits
- [ ] 2FA for all staff, least-privilege access
- [ ] Backups tested; incident response plan
- [ ] Load test passed (50× normal)
- [ ] Crisis playbook rehearsed

**Distribution & revenue**

- [ ] Social handles verified; content calendar for the first 60 days
- [ ] WhatsApp channel live
- [ ] Ad network approved; brand-safety settings
- [ ] At least 1 media partner and 1 data partner signed
- [ ] Grant applications submitted
- [ ] POL Pro waiting list page

---

# 19. Glossary

- **LGA:** Local Government Area (774 in Nigeria, including 6 FCT Area Councils).
- **Ward:** smallest electoral unit above polling units; each elects a councillor.
- **SIEC:** State Independent Electoral Commission, which runs LGA elections.
- **INEC / IReV:** Independent National Electoral Commission / its online result viewing portal.
- **NDPA / NDPC:** Nigeria Data Protection Act 2023 / Nigeria Data Protection Commission.
- **FOI:** Freedom of Information (Act 2011).
- **CPM:** advertising revenue per 1,000 impressions.
- **Brigading:** coordinated mass reactions to distort a score.
- **Confidence level:** how much verified data a score rests on.
- **Right of reply:** an official's chance to respond before and after publication.

---

# 20. Next steps (the next 14 days)

1. Decide on the final name and secure domains and handles.
2. Book a consultation with a Nigerian media and technology lawyer (bring sections 11 and 12).
3. Write a one-page summary for funders and partners (using sections 1–3 and 14).
4. Contact 3 potential partners (e.g. a fact-checker, a budget transparency group, a media house).
5. Recruit or confirm a tech lead and an editor-in-chief.
6. Start building the federal directory (469 legislators + 36 governors) in a spreadsheet. This is useful even before the app exists.
7. Choose the pilot state for Phase B.
8. Start Phase A development: directory, profiles, curated feed, scorecard generator.
