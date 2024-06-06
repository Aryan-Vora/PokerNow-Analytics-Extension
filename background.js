chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message in background script:", message);

  // Store data in local storage
  chrome.storage.local.set({winrate: message.winrate}, () => {
    if (chrome.runtime.lastError) {
      console.error("Error storing data:", chrome.runtime.lastError);
      sendResponse({status: "error", error: chrome.runtime.lastError});
    } else {
      console.log("Data stored in local storage:", {winrate: message.winrate});
      sendResponse({status: "success"});
    }
  });

  // Return true to indicate that the response will be sent asynchronously
  return true;
});
