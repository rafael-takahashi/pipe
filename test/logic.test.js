// Run: node --test test/*.test.js
"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const L = require("../logic.js");

test("buildCSS with nothing enabled is empty", () => {
  assert.strictEqual(L.buildCSS({}), "");
  assert.strictEqual(L.buildCSS({ ...L.DEFAULTS }), "");
});

test("buildCSS with one flag hides only that flag's selectors", () => {
  for (const key of Object.keys(L.RULES)) {
    const css = L.buildCSS({ [key]: true });
    assert.ok(css.endsWith(" { display: none !important; }"), key);
    const selectors = css.replace(/ \{ display: none !important; \}$/, "").split(",\n");
    assert.deepStrictEqual(selectors, L.RULES[key], key);
  }
});

test("DEFAULTS and RULES cover the same keys", () => {
  assert.deepStrictEqual(Object.keys(L.DEFAULTS).sort(), Object.keys(L.RULES).sort());
});

test("every popup toggle has a default", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "popup", "popup.html"), "utf8");
  const keys = [...html.matchAll(/data-key="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(keys.length > 0, "popup should have toggles");
  for (const k of keys) assert.ok(k in L.DEFAULTS, `popup key ${k} missing from DEFAULTS`);
});

test("missingDefaults keeps values already stored", () => {
  const missing = L.missingDefaults({ hideShorts: true, hideComments: false });
  assert.ok(!("hideShorts" in missing));
  assert.ok(!("hideComments" in missing));
  assert.deepStrictEqual(Object.keys(missing).sort(),
    Object.keys(L.DEFAULTS).filter((k) => k !== "hideShorts" && k !== "hideComments").sort());
  assert.deepStrictEqual(L.missingDefaults({ ...L.DEFAULTS }), {});
});
