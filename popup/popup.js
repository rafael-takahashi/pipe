/**
 * popup.js — Runs inside popup/popup.html
 *
 * 1. Reads current settings from browser.storage.sync
 * 2. Reflects them onto the toggle checkboxes
 * 3. Writes any change back to storage (the background script then notifies tabs)
 */

"use strict";

// ─── Grab every toggle input ──────────────────────────────────────────────────

/** @type {NodeListOf<HTMLInputElement>} */
const toggles = document.querySelectorAll(".toggle__input[data-key]");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sync the aria-checked attribute on the parent [role="switch"] element so
 * screen readers announce the correct state.
 * @param {HTMLInputElement} input
 */
function syncAria(input) {
  const switchEl = input.closest('[role="switch"]');
  if (switchEl) {
    switchEl.setAttribute("aria-checked", String(input.checked));
  }
}

// ─── Load & render settings ───────────────────────────────────────────────────

async function loadSettings() {
  const keys = Array.from(toggles).map((t) => t.dataset.key);
  const settings = await browser.storage.sync.get(keys);

  for (const toggle of toggles) {
    const key = toggle.dataset.key;
    toggle.checked = Boolean(settings[key]);
    syncAria(toggle);
  }
}

// ─── Persist changes ──────────────────────────────────────────────────────────

async function handleToggleChange(event) {
  const input = /** @type {HTMLInputElement} */ (event.target);
  const key = input.dataset.key;
  if (!key) return;

  syncAria(input);
  await browser.storage.sync.set({ [key]: input.checked });
}

// ─── Wire up listeners ────────────────────────────────────────────────────────

for (const toggle of toggles) {
  toggle.addEventListener("change", handleToggleChange);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

loadSettings().catch(console.error);
