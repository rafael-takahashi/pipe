"use strict";

const DEFAULTS = {
  hideShorts: false,
  hideTitle: false,
  hideDescription: false,
  hideNotifications: false,
  hideComments: false,
  hideRecommendations: false,
};

browser.runtime.onInstalled.addListener(async () => {
  const stored = await browser.storage.sync.get(null);
  const missing = {};
  for (const [k, v] of Object.entries(DEFAULTS)) {
    if (!(k in stored)) missing[k] = v;
  }
  if (Object.keys(missing).length) {
    await browser.storage.sync.set(missing);
  }
});

browser.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "sync") return;
  const tabs = await browser.tabs.query({ url: "*://*.youtube.com/*" });
  for (const tab of tabs) {
    browser.tabs
      .sendMessage(tab.id, { type: "pipe:settings-changed", changes })
      .catch(() => {});
  }
});
