chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message in background script:", message);
  chrome.storage.local.set(
    {
      tableCards: message.tableCards,
      playerCards: message.playerCards,
      winrate: message.winrate,
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error("Error storing data:", chrome.runtime.lastError);
      } else {
        console.log("Data stored in local storage:", {
          tableCards: message.tableCards,
          playerCards: message.playerCards,
          winrate: message.winrate,
        });
      }
    }
  );
});
