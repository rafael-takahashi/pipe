"use strict";

const inputs = document.querySelectorAll(".toggle__input[data-key]");

const load = async () => {
  const keys = Array.from(inputs, (i) => i.dataset.key);
  const settings = await browser.storage.sync.get(keys);
  for (const input of inputs) {
    input.checked = Boolean(settings[input.dataset.key]);
  }
};

for (const input of inputs) {
  input.addEventListener("change", () => {
    browser.storage.sync.set({ [input.dataset.key]: input.checked });
  });
}

load();
