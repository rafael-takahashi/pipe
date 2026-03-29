/**
 * background.js — Background Script (Firefox MV3)
 *
 * Responsibilities:
 *  - Set default settings on first install
 *  - Relay storage-change events to active YouTube tabs
 */

// ─── Default filter settings ────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  hideShorts:           false,
  hideTitleDescription: false,
  hideNotifications:    false,
  hideComments:         false,
  hideRecommendations:  false,
};

// ─── On install: write defaults only if nothing is stored yet ────────────────

browser.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "install") return;

  const stored = await browser.storage.sync.get(null);

  // Only write keys that are not already present
  const missing = Object.fromEntries(
    Object.entries(DEFAULT_SETTINGS).filter(([k]) => !(k in stored))
  );

  if (Object.keys(missing).length) {
    await browser.storage.sync.set(missing);
  }
});

// ─── Relay storage changes → content scripts in all YouTube tabs ─────────────

browser.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "sync") return;

  const tabs = await browser.tabs.query({ url: "*://*.youtube.com/*" });

  for (const tab of tabs) {
    browser.tabs
      .sendMessage(tab.id, { type: "SETTINGS_CHANGED", changes })
      .catch(() => {
        // Tab may not have the content script yet — safe to ignore
      });
  }
});
