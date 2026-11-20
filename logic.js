// Pure logic shared by content.js, background.js and the node tests (no browser APIs).
"use strict";

(function (root) {
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
    // Scoped to the watch page owner row; the same elements also appear in search results.
    hideChannel: [
      'ytd-watch-metadata ytd-video-owner-renderer #avatar',
      'ytd-watch-metadata ytd-video-owner-renderer #channel-name',
      'ytd-watch-metadata ytd-video-owner-renderer #attributed-channel-name',
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

  const DEFAULTS = {
    hideShorts: false,
    hideTitle: false,
    hideChannel: false,
    hideDescription: false,
    hideNotifications: false,
    hideComments: false,
    hideRecommendations: false,
  };

  const buildCSS = (settings) => {
    const selectors = [];
    for (const [key, sels] of Object.entries(RULES)) {
      if (settings[key]) selectors.push(...sels);
    }
    if (!selectors.length) return "";
    return selectors.join(",\n") + " { display: none !important; }";
  };

  // Only fill gaps, so an update never resets what the user already chose.
  const missingDefaults = (stored) => {
    const missing = {};
    for (const [k, v] of Object.entries(DEFAULTS)) {
      if (!(k in stored)) missing[k] = v;
    }
    return missing;
  };

  const api = { RULES, DEFAULTS, buildCSS, missingDefaults };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PipeLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
