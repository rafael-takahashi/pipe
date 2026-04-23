"use strict";

const STYLE_ID = "pipe-injected-styles";

const RULES = {
  hideShorts: [
    'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
    'ytd-rich-shelf-renderer[is-shorts]',
    'ytd-reel-shelf-renderer',
    'ytd-rich-item-renderer:has(a[href^="/shorts/"])',
    'ytd-video-renderer:has(a[href^="/shorts/"])',
    'ytd-grid-video-renderer:has(a[href^="/shorts/"])',
    'grid-shelf-view-model:has(ytm-shorts-lockup-view-model)',
    'ytd-guide-entry-renderer:has(a[title="Shorts"])',
    'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
    'ytd-search-filter-renderer:has(a[href*="youtube+shorts"])',
  ],
  hideTitle: [
    'ytd-watch-metadata #title',
    'ytd-watch-metadata h1.ytd-watch-metadata',
  ],
  hideDescription: [
    'ytd-watch-metadata #description',
    'ytd-watch-metadata ytd-text-inline-expander',
    '#description-inline-expander',
  ],
  hideNotifications: [
    '#notification-icon-label',
    'ytd-notification-topbar-button-renderer',
  ],
  hideComments: [
    'ytd-comments#comments',
    '#comments',
  ],
  hideRecommendations: [
    '#secondary #related',
    'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
    'ytd-compact-video-renderer',
    'ytd-watch-next-secondary-results-renderer',
    'ytd-feed-nudge-renderer',
  ],
};

let currentCSS = "";

const buildCSS = (settings) => {
  const selectors = [];
  for (const [key, sels] of Object.entries(RULES)) {
    if (settings[key]) selectors.push(...sels);
  }
  if (!selectors.length) return "";
  return selectors.join(",\n") + " { display: none !important; }";
};

const ensureStyleEl = () => {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(el);
    el.textContent = currentCSS;
  }
  return el;
};

const apply = (settings) => {
  currentCSS = buildCSS(settings);
  ensureStyleEl().textContent = currentCSS;
};

ensureStyleEl();

const guard = new MutationObserver(() => {
  const el = document.getElementById(STYLE_ID);
  if (!el || el.textContent !== currentCSS) {
    ensureStyleEl().textContent = currentCSS;
  }
});
guard.observe(document.documentElement, { childList: true, subtree: false });
if (document.head) {
  guard.observe(document.head, { childList: true });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    if (document.head) guard.observe(document.head, { childList: true });
  }, { once: true });
}

browser.storage.sync.get(null).then(apply);

window.addEventListener("yt-navigate-finish", () => {
  browser.storage.sync.get(null).then(apply);
});

window.addEventListener("yt-page-data-updated", () => {
  browser.storage.sync.get(null).then(apply);
});

browser.runtime.onMessage.addListener((msg) => {
  if (msg?.type !== "pipe:settings-changed") return;
  browser.storage.sync.get(null).then(apply);
});
