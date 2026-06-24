# Gotchas — PPAF site

## Reports won't load when opening the file directly (file://)
The Reports section fetches `reports/index.json`. Browsers block `fetch()` over the
`file://` protocol, so double-clicking `reports.html` shows the "loading elsewhere"
message instead of the reports.
**Fix / how to preview:** run a local server (`python3 -m http.server`) or view the
deployed Netlify URL. `reports.js` already detects this and shows a friendly explanation.

## Decap CMS needs Netlify Identity + Git Gateway enabled
`admin/` will load but can't log in until **Identity** and **Git Gateway** are enabled
in the Netlify dashboard. See README "Turn on board-member uploads."

## CMS branch must match the repo's default branch
`admin/config.yml` is set to `branch: main`. If the repo uses `master` or another
default branch, the CMS can't commit — update that line.

## Image paths from the CMS are root-absolute
Uploaded photos save as `/images/uploads/...` (leading slash). These resolve correctly
on Netlify (served from domain root) and via a local server, but NOT when opening pages
as `file://`. Another reason to preview through a server.
