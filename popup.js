document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup DOM content loaded");
  chrome.storage.local.get(["tableCards", "playerCards", "winrate"], (data) => {
    if (chrome.runtime.lastError) {
      console.error("Error retrieving data:", chrome.runtime.lastError);
      return;
    }

    console.log("Data retrieved from storage in popup:", data);

    const tableCards = data.tableCards || [];
    const playerCards = data.playerCards || [];
    const winrate = data.winrate || [];

    const playerCardsDiv = document.getElementById("player-cards");
    const tableCardsDiv = document.getElementById("table-cards");
    const winrateDiv = document.getElementById("winrate");
    const commonHandsDiv = document.getElementById("common-hands");
    if (playerCardsDiv) {
      playerCardsDiv.innerHTML = playerCards.join(", ");
    }

    if (tableCardsDiv) {
      tableCardsDiv.innerHTML = tableCards.join(", ");
    }

    if (winrateDiv) {
      winrateDiv.innerHTML = winrate.winrate + "%";
    }
    if (commonHandsDiv) {
      let handsHTML = "";
      if (winrate.move) {
        handsHTML = `Move: ${winrate.move}<br><br>`;
      } else {
        winrate.hands.forEach((handObj) => {
          handsHTML += `Hand: ${handObj.hand}<br> Odds: ${handObj.odds}%<br> Winrate: ${handObj.winrate}%<br><br>`;
        });
      }
      commonHandsDiv.innerHTML = handsHTML;
    }
  });
});
