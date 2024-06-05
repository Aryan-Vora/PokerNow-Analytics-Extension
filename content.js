import {Hand} from "pokersolver";

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

//TODO - add intial folds
//find them from https://blackjackenterprise545.weebly.com/poker-ev-chart-starting-hands.html

function getWinrate(community, hand) {
  if (hand.length !== 2) {
    throw new Error("Hand must have exactly 2 cards.");
  }

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
  chrome.runtime.sendMessage({tableCards, playerCards, winrate}, (response) => {
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
