# monkeydg.com redesign brief (attempt 2)

This brief is for whoever picks up the redesign next, probably Claude after a context reset.
It records what David wants, what went wrong last time, and what's already known about the codebase.
Read all of it before touching anything.

This file lives in `.github/`, which the deploy workflow already excludes from the S3 sync,
so it never goes live.

## Attempt 2 status

Built on `claude/gracious-planck-ody04j` on top of the legacy site. Decisions made without
asking, so revisit them if David disagrees:

- Fonts: Archivo (headings and body) and Courier Prime (matches the typewriter wordmark).
- The CASCO card on the professional volunteering carousel stays for now (question 4 below).
- The pre-AI quip now sits as a small note in the POG section (the Side B divider was removed).
- Coinbase dates, GPAs, and the CV PDF are unchanged pending questions 1 to 3 below.
- Certification numbers come from the June 2024 CV.

## Where things stand (before attempt 2)

- Branch: `claude/gracious-planck-ody04j`. The site on this branch is the **original design**,
  plus one content change: the Coinbase role added to `professional.html` (commit `c45db3a`).
  Start from here.
- The first redesign attempt was rejected. It's archived in the closed PR
  [monkeyDG/monkeydg.com#2](https://github.com/monkeyDG/monkeydg.com/pull/2) (commit `edd1b99`).
  Reuse pieces from it only where this brief says to.
- A private preview of the rejected redesign still exists as a Claude artifact
  (https://claude.ai/artifact/AH6FpcrnR2Sjmv54L6LkqP). Ignore it; delete it only if David asks.
- Nothing deploys until something is pushed to `master`. Don't open a PR unless David asks.

## What David said about attempt 1

His verdict was "a huge miss". In his words and paraphrase:

- "It's lost all its character. I liked it so much more before."
- "It's no longer interactive and fun. It's so boring and stale and plain."
- "This reads too much like a Claude site": the font (Instrument Serif + Inter + JetBrains Mono)
  and the copy.
- The copy used too many AI tells: em dashes, "not X, but Y" constructions, and fluffy words.
  Some CV language is fine, but it was too much in places.
- A bit **too much** Coinbase. (Mid-build he'd asked to emphasize Coinbase more. The result,
  a giant blue "Coinbase" wordmark feature section, overshot. Aim for: clearly his current job,
  and a highlight, without taking over the site.)

What he **did** like:

- All the data science additions and how the site leaned into data science more. That includes
  the live simulated Bayesian A/B test widget (posterior curves, lift with a credible interval,
  P(variant > control), a verdict at the end) and the general DS flavor.
- The 404 joke: "Result not significant (p = 0.404)."

## What he wants in attempt 2

### Keep the original site's character

This is the top priority. Redesign it, but it has to feel like **his** site, evolved, and not like
a template or like Claude produced it.

- **Home page (`index.html`):** he loved the original. It's a split portrait of his face: the left
  half is a real photo, the right half a vector illustration. It moves and reacts as you move the
  mouse. Clicking the left side opens the professional side, and clicking the right side opens
  the creative side. There's also a typewriter "Hi! My name's David." Keep this concept and
  mechanic. Polish and modernize it, but don't replace it.
  - Code: `index.html` plus `assets/js/index.js` (`animateHome`, `animateFace`, `resizeFace`)
    and `assets/css/index.css`.
  - Images: `assets/css/images/index/dg-face-left.png` (photo cutout) and `dg-face-right.png`
    (vector), with `.pdn` sources alongside.
  - Mobile uses two stacked buttons and a background image instead of the face effect.
- Keep the multi-page structure: home (split face), professional, creative, contact, 404.
- Keep the voice of the original copy: first person, casual, a little self-deprecating. For
  example: "I'm a data geek with a deep background in business and management…", and the AVRA
  chip-truck-rally line ("…our guitarist promised would be our big break (…it wasn't)").
- Keep the brand: the monkey logo (light blue `#66d6ff` on black), the "David Gallo / 🐒"
  wordmark, and the `#66d6ff` accent.
- Interactive and fun, but not tacky. That was his original ask, and attempt 1 went too far
  toward "clean and quiet".

### Typography and copy rules

- **Don't use** Instrument Serif, Inter, or JetBrains Mono as the look. Those read as "Claude".
  The original used Open Sans (Light/Regular/Bold) and JetBrains Mono. Neither was actually
  loaded, so the browser was falling back to system fonts. Pick something with personality that
  fits him: data-nerd, musician, maker.
- Copy rules:
  - No em dashes.
  - No "not X, but Y" / "it's not X, it's Y" patterns.
  - No colon-then-reveal sentences.
  - No stock phrases like "worth noting", "delve", "leverage", "passionate", "seamless",
    "cutting-edge", or "at the intersection of".
  - Short, plain sentences in his voice.
  - Resume bullets can be a bit formal, but keep the fluff down.

### Data science flavor (keep and expand)

- Bring back the **A/B test widget** idea (from `edd1b99`: `assets/js/experiment.js` plus the
  `.exp*` styles in `assets/css/site.css`). Restyle it so it fits the new look.
- Keep the 404 joke ("p = 0.404").
- More DS references and easter eggs are welcome, as long as they're tasteful.

### Content changes

- **Location is now Ottawa, Ontario.** It used to say Montreal. Update the professional
  "City" field (`professional.html`) and the contact page's "Location" (`contact.html`), plus
  anything new that says where he lives now. Past roles
  keep their real locations (Zinnia was Montreal, Delivery Hero was Berlin).
- **Coinbase** is the current role. Title: Data Scientist, International Data Science team,
  leading data science for Canada and Brazil (LATAM). His LinkedIn description, verbatim:
  > I have full ownership over data science, experimentation, machine learning, and analytics
  > initiatives for Canada and LATAM. I build ML models, run and analyze A/B/n tests with complex
  > statistical inference, maintain data pipelines, and generate data insights.
  >
  > I build AI-native tools, workflows, and analyses for my stakeholders and keep up to date with
  > the latest developments in LLMs and AI platforms, building custom harnesses, skills,
  > connectors, and automations.
  >
  > I provide strategic leadership and insights for senior country executives to make educated
  > decisions, ship quickly, and track results with statistical relevance.
  >
  > Python, Snowflake SQL, Airflow, Claude Code/Codex + Cursor + MCPs + Agents.
- **Professional skills need updating.** The old section has six animated bars: Business
  Communication, Project Management, Data Visualization, Data Analytics, Machine Learning, Cloud
  Services. Replace the fluffier ones with modern skills: LLMs, AI tooling, agents/harnesses,
  MCP, experimentation/causal inference, and so on. The "technology I like to use" logo grid
  needs the same refresh: add Snowflake, Airflow, Claude Code, Cursor, etc., and drop dated ones
  like Klipfolio and MS365. Bars that claim a precise "percentage" of a skill are a bit
  cheesy; consider a more data-flavored visualization.
- **Creative page:**
  - **Remove CASCO** (both the slideshow slide and the section). It's too old now.
    - Open question: he didn't mention the CASCO card in the *professional* volunteering
      slideshow. Ask before removing that one.
  - **Keep the POG Discord live chat embed** (WidgetBot, loaded from
    `cdn.jsdelivr.net/npm/@widgetbot/html-embed`). Attempt 1 removed it and he wants it back.
    The original loaded two copies (mobile and desktop) and hid one with CSS. Better to load one
    responsive copy, ideally only once the section is near the viewport.
  - For his **technical projects** (POG bot, Voron printer, PC builds, the website itself), add a
    light quip that he built these before AI was around, e.g. "built the old-fashioned way,
    before AI could write it for me." Keep it short and in his voice.
- Gallery captions in the original are wrong in places. In `creative.html`, deringer,
  commissioner and boots are all captioned "Spiker Pistol", and the spiker video is captioned
  "Lumine Edge". Correct labels: Deringer (Planetside 2), Commissioner (Planetside 2), Armour
  boots, Spiker pistol video.

### Things to confirm with David (unresolved from attempt 1)

1. Coinbase start date. The current placeholder is 2025–Present, with Zinnia as 2024–2025.
2. GPAs. The site says 9.2/10 for both degrees. His June 2024 CV says 9.6 (MSc, TBS) and
   9.4 (BCom, uOttawa).
3. `assets/docs/David_Gallo_CV.pdf` is from June 2024 and doesn't include Coinbase. He should
   upload a new one.
4. Whether the CASCO volunteering entry on the professional page stays.

## Useful facts from his CV (June 2024)

Accurate numbers to use:

- Delivery Hero: improved delivery-time estimations by 15% globally with a density-based
  clustering model that found delivery zones with problematic overlaps. Used Tableau and
  Streamlit + Seaborn for KPI tracking.
- Deloitte: led QA and the data analytics stream for a large federal cloud platform used by
  400K+ new Canadian migrants a year. Led analytics for an NLP-driven market research product
  at a fintech. Deloitte Green Dot (2021) and Silver Dot (2022).
- CIRA title on the CV: "Cybersecurity ML Engineer/Data Scientist".
- Award years:
  - TBS Datathon 1st (2022)
  - JDC Coach of the Year (2022)
  - Accenture Scholarship (2020)
  - uOttawa Merit Scholarship (2016–2020)
  - JDC 2nd place (2019) and Academic VIP (2018–2019)
  - LAZICC 3rd place (2018)
  - Craig Cameron Memorial Scholarship (2016)
  - AP Scholar (2016)
  - Computer & IS Award (2015)
- Space Concordia volunteering text says "launch a satellite in 2025". It's past 2025 now, so
  fix the tense. The RCM text says "after 16 of practice", which is missing "years".

## Codebase notes (the original site)

- Static HTML/CSS/JS with jQuery 1.7.2 (from `ajax.microsoft.com`), TypeIt 7 (jsdelivr),
  Modernizr, justifiedGallery + lightGallery 2.1.1 (vendored in `assets/plugins/`), Swiper 7
  (unpkg), Bootstrap 5 CSS on the creative page (jsdelivr), and WidgetBot.
- Images live under `assets/css/images/` (an odd location). That folder includes about 190 MB
  of raw `.pdn` files and uncompressed originals, and all of it gets deployed to S3 because the
  workflow only excludes `.git*`. Attempt 1 moved the originals to `design-sources/` and built
  WebP copies with `tools/build-images.mjs` (sharp). That tooling is in `edd1b99` and worth
  bringing back even if nothing else is.
- Deploy: `.github/workflows/workflow.yml` runs on push to `master`. It syncs to S3 with
  `--delete` and invalidates two CloudFront distributions (monkeydg.com and dgallo.ca).
- Contact form: POSTs JSON `{senderName, senderEmail, senderPhone, message}` to
  `https://cw6u5cl22b.execute-api.us-east-2.amazonaws.com/default/SES-email-sending-func`
  (API Gateway → Lambda → SES). Keep that contract.
- Lots of copy-pasted JS: `professional.js` has one hand-written trigger function per timeline
  item. The volunteering slideshow wraps every word in its own `<span>`. Worth cleaning up
  without changing the look.

## Working notes for the sandbox (so testing doesn't eat time)

- Chromium via Playwright works: `require('/opt/node22/lib/node_modules/playwright')`. Serve the
  repo with `python3 -m http.server` and load it via `http://127.0.0.1:<port>`.
- Outbound HTTPS goes through a proxy. Launch Chromium with
  `args: ['--proxy-server=https=127.0.0.1:<proxy port from $HTTPS_PROXY>']` so local
  `http://` still loads directly.
- `cdn.jsdelivr.net` is **blocked (403)** in the sandbox, so TypeIt, WidgetBot and Bootstrap
  won't load in local screenshots, even though they work in production. The same goes for
  `ajax.microsoft.com` (jQuery), which fails through the proxy. Vendor these locally or stub
  them when testing, or the old pages render broken in screenshots.
- `fonts.googleapis.com` and `fonts.gstatic.com` are reachable, and npm installs work.
- `html { scroll-behavior: smooth }` makes scripted scroll-then-screenshot passes miss reveal
  animations. Set it to `auto` in the test harness before scrolling.
- Only the designated branch can be pushed. Tag pushes are rejected.
- For a shareable preview, publish an artifact. The viewer strips your own doctype/head, blocks
  iframes (YouTube, WidgetBot), blocks external `fetch` (contact form), only allows font files
  from Google Fonts (inline others as data URIs), and caps binaries at 15 MB each.
