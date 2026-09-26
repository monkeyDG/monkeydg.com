# monkeydg.com

Personal site of David Gallo, served at [monkeydg.com](https://monkeydg.com) and [dgallo.ca](https://dgallo.ca).

Plain static HTML, CSS, and JavaScript. No framework, no bundler, no jQuery.

## Pages

| Page | What's on it |
| --- | --- |
| `index.html` | The split face. It follows the mouse, and clicking a side opens that portfolio. |
| `professional.html` | Profile, skills forest plot, work timeline, a live simulated A/B test, tools, education, awards, volunteering. |
| `creative.html` | Project slideshow, AVRA, POG (with the live Discord embed), Voron, PC builds, this site, and the props gallery. |
| `contact.html` | Contact form. It posts to an API Gateway + Lambda + SES mailer. |
| `404.html` | p = 0.404. Uses root-relative links because CloudFront serves it for any missing path. |

## Layout

```
assets/css/site.css      shared tokens, header, footer, buttons, reveal animations
assets/css/<page>.css    one stylesheet per page
assets/js/site.js        mobile nav, scroll reveals, typewriter
assets/js/<page>.js      one script per page (experiment.js is the A/B test)
assets/img/              generated web images (don't edit by hand)
assets/video/            the two gallery videos, re-encoded for the web
design-sources/          originals, .pdn files, raw photos. Never deployed.
tools/                   image and icon build scripts
```

## Working on it

```sh
npm install        # only needed for the build scripts
npm run images     # rebuild assets/img from design-sources
npm run icons      # rebuild assets/img/icons.svg (tool logos, from Simple Icons)
npm run serve      # http://localhost:8080
```

To add a photo, drop the original into `design-sources/`, add a line to the manifest in
`tools/build-images.mjs`, and run `npm run images`. Gallery photos in
`design-sources/creative/projects/` are picked up automatically.

## Deploying

Pushing to `master` runs `.github/workflows/workflow.yml`. It syncs the repo to S3 (skipping
`design-sources/`, `tools/`, `.github/`, and the npm files) and invalidates both CloudFront
distributions.

## Rolling back

The previous design is the parent of the redesign commit on this branch. To go back, revert
the redesign commit, or reset `master` to the commit before it.
