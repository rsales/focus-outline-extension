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

async function setIcon(tabId, enabled) {
  await chrome.action.setIcon({
    tabId,
    path: {
      "16": enabled ? "icons/on.png" : "icons/off.png"
    }
  });

  await chrome.action.setBadgeText({
    tabId,
    text: enabled ? "ON" : ""
  });
}

async function sendCommand(tabId, action) {
  try {
    await chrome.tabs.sendMessage(tabId, { action });
  } catch (e) {
    // content script might not be ready yet
  }
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url) return;

  const domain = getDomain(tab.url);
  const enabled = await getState(domain);

  await setIcon(tabId, enabled);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const domain = getDomain(tab.url);
  const enabled = await getState(domain);

  if (enabled) {
    await sendCommand(tabId, "ENABLE");
  }

  await setIcon(tabId, enabled);
});

chrome.runtime.onMessage.addListener(async (message) => {
  const { tabId, url, action } = message;

  const domain = getDomain(url);
  const enabled = action === "ENABLE";

  await chrome.storage.local.set({ [domain]: enabled });

  await sendCommand(tabId, action);
  await setIcon(tabId, enabled);
});