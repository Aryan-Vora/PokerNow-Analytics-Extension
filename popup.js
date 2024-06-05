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
    const content1 = document.getElementById("content1");
    const content2 = document.getElementById("content2");
    const title1 = document.getElementById("title1");
    const title2 = document.getElementById("title2");
    console.log(winrate);
    if (playerCardsDiv) {
      playerCardsDiv.innerHTML = playerCards.join(", ");
    }

    if (tableCardsDiv) {
      tableCardsDiv.innerHTML = tableCards.join(", ");
    }
    //strength
    if (winrate.strength || winrate.move) {
      title1.innerHTML = "Strength:";
      content1.innerHTML = winrate.strength + "%";

      //moves
      title2.innerHTML = "Moves:";
      content2.innerHTML = winrate.move;
    } else {
      //winrate
      title1.innerHTML = "Winrate:";
      content1.innerHTML = winrate.winrate + "%";

      //common hands
      title2.innerHTML = "Common Hands:";

      let handsHTML = "";
      winrate.hands.forEach((handObj) => {
        handsHTML += `Hand: ${handObj.hand}<br> Odds: ${handObj.odds}%<br> Winrate: ${handObj.winrate}%<br><br>`;
      });
      content2.innerHTML = handsHTML;
    }
  });
});
