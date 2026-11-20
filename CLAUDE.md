# pipe

Firefox extension (MV3) that hides parts of YouTube. Listed on AMO.

- Pure logic lives in `logic.js` (no browser/DOM APIs) and is tested with `node --test test/*.test.js`.
- Lint: `npm ci --ignore-scripts && npx --no-install web-ext lint --source-dir . --warnings-as-errors --ignore-files "test/**" package.json package-lock.json README.md`
- Release: bump `version` in manifest.json, then tag `v<version>`; `.github/workflows/release.yml` submits to AMO.

## Rules

- Before adding any dependency or action, look up the exact name in its registry. Check that it exists, that it's the intended repo and maintainer, and that it has a history. Show the user what you found, and never install a package to find out whether it's real.
- Comments explain why, never what.
- The user pushes and tags. Commit only when asked.
