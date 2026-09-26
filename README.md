# monkeydg.com

Personal site of David Gallo, data scientist on Coinbase's International Data Science team.
Live at [monkeydg.com](https://monkeydg.com) and [dgallo.ca](https://dgallo.ca).

Hand-written HTML, CSS, and vanilla JavaScript. No frameworks, no build step, no third-party
scripts at runtime.

## Structure

```
index.html            Home: hero, Coinbase, about, experience, toolkit, education, recognition, leadership, contact
creative.html         Workshop: side projects and the photo gallery
404.html              Not-found page (absolute paths, served for any URL depth)
professional.html     Redirect → /#experience (keeps old links working)
contact.html          Redirect → /#contact

assets/
  css/site.css        The only stylesheet: design tokens (light + dark), components, pages, print
  js/site.js          Shared: theme toggle, nav + scrollspy, scroll reveals, carousel, contact form
  js/experiment.js    Hero widget: a simulated Bayesian A/B test (Beta-Binomial posteriors)
  js/workshop.js      Workshop: YouTube facades, gallery filters, lightbox
  fonts/              Self-hosted Inter, Instrument Serif, JetBrains Mono (latin subsets)
  img/                Generated, web-optimized images (do not edit by hand)
  video/              Gallery videos
  docs/               CV and MSc thesis PDFs

design-sources/       Original photos, .pdn files, and the social-card source. Not deployed.
tools/                build-images.mjs: regenerates assets/img from design-sources
```

## Local development

Any static server works:

```sh
npm run serve          # http://localhost:8080
```

## Images

Originals live in `design-sources/`; `assets/img/` is generated from them.
To add or change an image, add the original, list it in `MANIFEST` in `tools/build-images.mjs`
(gallery photos in `design-sources/creative/projects/` are picked up automatically), then:

```sh
npm install
npm run images
```

The social card `assets/img/og-card.png` is a 1200×630 screenshot of `design-sources/og-card.html`.

## Deploy

Pushing to `master` runs `.github/workflows/workflow.yml`: sync to S3 (excluding
`design-sources/`, `tools/`, and repo files), then invalidate both CloudFront distributions.
The contact form posts JSON to an API Gateway + Lambda function that sends mail via SES.

## Rolling back the 2026 redesign

The previous design is tagged `legacy-site` (it already includes the Coinbase role).
To go back, either revert the redesign commit on `master`:

```sh
git revert <redesign-commit>
```

or restore the old tree wholesale:

```sh
git checkout legacy-site -- . && git commit -m "Restore legacy site"
```
