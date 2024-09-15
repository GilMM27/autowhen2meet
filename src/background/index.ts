chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.log) {
    console.log('Received from content script:', message.log);
  }
});
