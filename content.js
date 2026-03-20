let styleElement = null;

function applyStyle() {
  if (styleElement) return;

  styleElement = document.createElement("style");
  styleElement.id = "focus-outline-extension";

  styleElement.textContent = `
    .focus-outline-active :focus {
      outline: 3px dashed red !important;
      outline-offset: 2px !important;
      z-index: 999 !important;
    }
  `;

  document.head.appendChild(styleElement);
  document.documentElement.classList.add("focus-outline-active");
}

function removeStyle() {
  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }

  document.documentElement.classList.remove("focus-outline-active");
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "ENABLE") applyStyle();
  if (message.action === "DISABLE") removeStyle();
});