const button = document.getElementById("toggle");

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

async function getState(domain) {
  const data = await chrome.storage.local.get(domain);
  return data[domain] ?? false;
}

async function updateUI(tab, domain) {
  const enabled = await getState(domain);
  button.textContent = enabled
    ? "Disable on this site"
    : "Enable on this site";
}

button.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const domain = getDomain(tab.url);
  const enabled = await getState(domain);

  chrome.runtime.sendMessage({
    action: enabled ? "DISABLE" : "ENABLE",
    tabId: tab.id,
    url: tab.url
  });

  window.close();
});

(async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const domain = getDomain(tab.url);
  updateUI(tab, domain);
})();