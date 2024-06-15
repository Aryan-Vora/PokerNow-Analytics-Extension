import {Hand} from "pokersolver";
import {getStrength} from "./strength.js";
let tableCards = [];
let playerCards = [];
let winrate = [];

function createDeck() {
  const suits = ["h", "d", "c", "s"];
  const values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "T",
    "J",
    "Q",
    "K",
    "A",
  ];
  const deck = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push(value + suit);
    }
  }

  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function getWinrate(community, hand) {
  if (hand.length !== 2) {
    throw new Error("Hand must have exactly 2 cards.");
  }
  if (community.length === 0) {
    let strength = getStrength(hand);
    if (strength < 40) {
      console.log("Folding hand", hand);
      return {strength: strength, move: ["FOLD"]};
    } else if (strength < 60) {
      return {strength: strength, move: ["CALL"]};
    } else {
      return {strength: strength, move: ["RAISE"]};
    }
  } else {
    const allCards = hand.concat(community).map((card) => card.toUpperCase());

    let deck = createDeck();
    const knownCards = new Set(allCards);

    deck = deck.filter((card) => !knownCards.has(card.toUpperCase()));

    const simulations = 10000;
    const handRanks = {};
    const winCounts = {};
    let overallWins = 0;

    for (let i = 0; i < simulations; i++) {
      const tempDeck = shuffleDeck([...deck]);
      const sample = tempDeck
        .slice(0, 5 - community.length)
        .map((card) => card.toUpperCase());
      const fullBoard = community.concat(sample);

      const playerHand = Hand.solve(hand.concat(fullBoard));
      const rank = playerHand.name;

      if (!handRanks[rank]) {
        handRanks[rank] = 0;
        winCounts[rank] = 0;
      }
      handRanks[rank]++;

      const opponentHandCards = tempDeck.slice(
        5 - community.length,
        7 - community.length
      );
      const opponentHand = Hand.solve(opponentHandCards.concat(fullBoard));

      if (playerHand.rank > opponentHand.rank) {
        winCounts[rank]++;
        overallWins++;
      }
    }

    const sortedHandRanks = Object.entries(handRanks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const results = sortedHandRanks.map(([handName, count]) => ({
      hand: handName,
      odds: ((count / simulations) * 100).toFixed(2),
      winrate: ((winCounts[handName] / count) * 100).toFixed(2),
    }));

    const overallWinrate = ((overallWins / simulations) * 100).toFixed(2);
    console.log({winrate: overallWinrate, hands: results});
    return {winrate: overallWinrate, hands: results};
  }
}

function getTableCards() {
  const tableCardElements = document.querySelectorAll(
    ".table-cards .card-container"
  );
  const tableCards = Array.from(tableCardElements)
    .map((cardElement) => {
      const valueElement = cardElement.querySelector(".value");
      if (valueElement.textContent === "10") {
        valueElement.textContent = "T";
      }
      const suitElement = cardElement.querySelector(".suit");
      return valueElement && suitElement
        ? `${valueElement.textContent}${suitElement.textContent}`
        : "";
    })
    .filter((card) => card !== "");
  return tableCards;
}

function getPlayerCards() {
  const playerCardElements = document.querySelectorAll(
    ".you-player .table-player-cards .card-container"
  );
  const playerCards = Array.from(playerCardElements)
    .map((cardElement) => {
      const valueElement = cardElement.querySelector(".value");
      if (valueElement.textContent === "10") {
        valueElement.textContent = "T";
      }
      const suitElement = cardElement.querySelector(".suit");
      return valueElement && suitElement
        ? `${valueElement.textContent}${suitElement.textContent}`
        : "";
    })
    .filter((card) => card !== "");
  return playerCards;
}

//TODO - Only send the response when the table card or player card changes
function sendResponse() {
  tableCards = getTableCards();
  playerCards = getPlayerCards();
  winrate = getWinrate(tableCards, playerCards);
  chrome.runtime.sendMessage({winrate}, (response) => {
    if (chrome.runtime.lastError) {
      console.log("Cards updates and am definitely not hiding any errors!");
    }
  });
  return true;
}

setInterval(() => {
  try {
    sendResponse();
  } catch (error) {
    console.error("Error during interval execution:", error);
  }
}, 1000);
const myDiv = document.createElement("div");
myDiv.id = "myDiv";
myDiv.style.width = "200px";
myDiv.style.height = "100vh";
myDiv.style.position = "fixed";
myDiv.style.right = "0";
myDiv.style.top = "0";
myDiv.style.backgroundColor = "#201e1f";
myDiv.style.color = "white";
myDiv.style.overflow = "auto";
myDiv.style.zIndex = "1000";
myDiv.style.padding = "10px";

document.body.appendChild(myDiv);

const pokerNowScreen = document.body;
pokerNowScreen.style.marginRight = "200px";

const style = document.createElement("style");
style.innerHTML = `
  .title {
    font-size: 32px; 
    font-weight: bold;
    margin-top: 30px;
  }
  .body {
    font-size: 24px; 
  }
  #showButton {
    display: none; 
    position: fixed;
    right: 10px;
    top: 0px;
    z-index: 1001;
    background: none;
    border: none;
    color: white;
    font-size: 32px;
    cursor: pointer;
  }
  #hideButton {
    position: absolute;
    right: 10px;
    top: 10px;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
  }
`;
document.head.appendChild(style);

function updateDivContent() {
  chrome.storage.local.get(["winrate"], (data) => {
    if (chrome.runtime.lastError) {
      console.error("Error retrieving data:", chrome.runtime.lastError);
      return;
    }

    console.log("Data retrieved from storage in popup:", data);
    const winrate = data.winrate || [];

    let htmlContent = "";
    if (winrate.strength || winrate.move) {
      htmlContent += `<div class="title">Strength:</div><div class="body">${winrate.strength}%</div>`;
      htmlContent += `<div class="title">Moves:</div><div class="body">${winrate.move}</div>`;
    } else {
      htmlContent += `<div class="title">Winrate:</div><div class="body">${winrate.winrate}%</div>`;
      htmlContent += `<div class="title">Common Hands:</div><div class="body">`;

      winrate.hands.forEach((handObj) => {
        htmlContent += `Hand: ${handObj.hand}<br> Odds: ${handObj.odds}%<br> Winrate: ${handObj.winrate}%<br><br>`;
      });

      htmlContent += `</div>`;
    }

    myDiv.innerHTML = htmlContent;
    myDiv.appendChild(hideButton);
  });
}

const showButton = document.createElement("button");
showButton.id = "showButton";
showButton.innerHTML = "+";
showButton.addEventListener("click", () => {
  myDiv.style.display = "block";
  showButton.style.display = "none";
});

const hideButton = document.createElement("button");
hideButton.id = "hideButton";
hideButton.innerHTML = "X";
hideButton.addEventListener("click", () => {
  myDiv.style.display = "none";
  showButton.style.display = "block";
});

document.body.appendChild(showButton);
updateDivContent();
setInterval(updateDivContent, 1000);
