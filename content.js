/**
 * content.js — Injected into every YouTube page.
 *
 * Strategy
 * ────────
 * Inject a <style> tag synchronously at document_start (before any HTML is
 * parsed), then fill it with the correct CSS rules as soon as the storage
 * read resolves. This prevents any flash of unhidden content.
 *
 * YouTube event glossary (relevant to this script):
 *   yt-navigate-finish   — fired on every SPA navigation (clicking a link).
 *                          NOT fired on a fresh page load.
 *   yt-page-data-updated — fired when YouTube's polymer components have
 *                          finished rendering. Fires on both fresh loads AND
 *                          SPA navigations, so it covers all cases.
 */

// ─── Selector map ─────────────────────────────────────────────────────────────
// Each key matches a settings key; the value lists CSS selectors to hide.

const FILTER_RULES = {
  hideShorts: [
    'ytd-rich-item-renderer:has(a[href^="/shorts/"])',
    'ytd-video-renderer:has(a[href^="/shorts/"])',
    'ytd-grid-video-renderer:has(a[href^="/shorts/"])',
    'grid-shelf-view-model:has(ytm-shorts-lockup-view-model)',
    'ytd-guide-entry-renderer:has(a[href="/shorts/"])',
    'ytd-mini-guide-entry-renderer:has(a[href="/shorts/"])',
    'yt-chip-cloud-chip-renderer',
    'ytd-search-filter-renderer:has(a[href="/results?search_query=youtube+shorts"])',
  ],

  hideTitleDescription: [
    'ytd-watch-metadata #title',
    'ytd-watch-metadata #description',
    'ytd-watch-metadata ytd-text-inline-expander',
  ],

  hideNotifications: [
    '#notification-icon-label',
    'ytd-notification-topbar-button-renderer',
  ],

  hideComments: [
    'ytd-comments#comments',
  ],

  hideRecommendations: [
    '#secondary #related',
    "'ytd-browse[page-subtype='home'] ytd-rich-grid-renderer",
    '.ytp-endscreen-content',
    'ytd-feed-nudge-renderer',
  ],
};

// ─── Style injection ──────────────────────────────────────────────────────────

const STYLE_ID = "yt-cleaner-styles";

// Cached so the MutationObserver can re-inject without a storage read.
let _currentSettings = {};

function buildCSS(settings) {
  return Object.entries(FILTER_RULES)
    .filter(([key]) => settings[key] === true)
    .flatMap(([, selectors]) => selectors)
    .map((sel) => `${sel} { display: none !important; }`)
    .join("\n");
}

function applyStyles(settings) {
  _currentSettings = settings;

  let styleEl = document.getElementById(STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(styleEl);
  }

  styleEl.textContent = buildCSS(settings);
}

// ─── Synchronous setup (runs before any HTML is parsed) ──────────────────────
// Inject an empty style tag and the removal guard immediately, without
// waiting for the async storage read. This claims our spot in <head> early.

(function setupEarly() {
  const styleEl = document.createElement("style");
  styleEl.id = STYLE_ID;
  (document.head || document.documentElement).appendChild(styleEl);

  // Guard: if YouTube ever removes our tag, re-inject it.
  const observer = new MutationObserver(() => {
    if (!document.getElementById(STYLE_ID)) {
      applyStyles(_currentSettings);
    }
  });
  observer.observe(document.head || document.documentElement, { childList: true });
})();

// ─── Async init: fill the style tag with real rules ──────────────────────────

async function init() {
  const settings = await browser.storage.sync.get(null);
  applyStyles(settings);
}

init();

// ─── Re-apply when YouTube components finish rendering ───────────────────────
// yt-page-data-updated fires on BOTH fresh page loads and SPA navigations,
// making it the most reliable hook for ensuring styles are applied after
// YouTube's polymer components have initialised.

window.addEventListener("yt-page-data-updated", () => {
  browser.storage.sync.get(null).then(applyStyles);
});

// ─── React to settings changes pushed by the background script ───────────────

browser.runtime.onMessage.addListener((message) => {
  if (message.type !== "SETTINGS_CHANGED") return;
  browser.storage.sync.get(null).then(applyStyles);
});
