"use strict";

const STYLE_ID = "pipe-injected-styles";

const { buildCSS } = PipeLogic;

let currentCSS = "";

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
