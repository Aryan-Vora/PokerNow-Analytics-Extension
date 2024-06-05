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
const handStrength = {
  AA: 85,
  AKs: 67,
  AQs: 66,
  AJs: 65,
  ATs: 65,
  A9s: 62,
  A8s: 61,
  A7s: 60,
  A6s: 59,
  A5s: 58,
  A4s: 58,
  A3s: 57,
  A2s: 57,
  AKo: 65,
  KK: 82,
  KQs: 63,
  KJs: 62,
  KTs: 61,
  K9s: 58,
  K8s: 57,
  K7s: 56,
  K6s: 55,
  K5s: 54,
  K4s: 54,
  K3s: 53,
  K2s: 52,
  AQo: 64,
  KQo: 61,
  QQ: 80,
  QJs: 59,
  QTs: 58,
  Q9s: 56,
  Q8s: 54,
  Q7s: 53,
  Q6s: 52,
  Q5s: 52,
  Q4s: 51,
  Q3s: 50,
  Q2s: 49,
  AJo: 64,
  KJo: 58,
  QJo: 55,
  JJ: 77,
  JTs: 57,
  J9s: 55,
  J8s: 54,
  J7s: 51,
  J6s: 50,
  J5s: 50,
  J4s: 48,
  J3s: 47,
  J2s: 46,
  ATo: 63,
  KTo: 56,
  QTo: 54,
  JTo: 50,
  TT: 75,
  T9s: 54,
  T8s: 53,
  T7s: 50,
  T6s: 49,
  T5s: 49,
  T4s: 47,
  T3s: 46,
  T2s: 45,
  A9o: 62,
  K9o: 55,
  Q9o: 52,
  J9o: 49,
  T9o: 48,
  99: 72,
  "98s": 52,
  "97s": 51,
  "96s": 49,
  "95s": 48,
  "94s": 47,
  "93s": 46,
  "92s": 45,
  A8o: 61,
  K8o: 54,
  Q8o: 51,
  J8o: 47,
  T8o: 45,
  "98o": 44,
  88: 70,
  "87s": 51,
  "86s": 50,
  "85s": 48,
  "84s": 47,
  "83s": 46,
  "82s": 45,
  A7o: 60,
  K7o: 53,
  Q7o: 50,
  J7o: 46,
  T7o: 43,
  "97o": 43,
  "87o": 42,
  77: 66,
  "76s": 49,
  "75s": 48,
  "74s": 46,
  "73s": 45,
  "72s": 44,
  A6o: 59,
  K6o: 52,
  Q6o: 49,
  J6o: 45,
  T6o: 42,
  "96o": 42,
  "86o": 41,
  "76o": 40,
  66: 63,
  "65s": 47,
  "64s": 46,
  "63s": 45,
  "62s": 44,
  A5o: 58,
  K5o: 51,
  Q5o: 48,
  J5o: 44,
  T5o: 41,
  "95o": 41,
  "85o": 40,
  "75o": 39,
  "65o": 38,
  55: 62,
  "54s": 45,
  "53s": 44,
  "52s": 43,
  A4o: 58,
  K4o: 51,
  Q4o: 48,
  J4o: 44,
  T4o: 41,
  "94o": 40,
  "84o": 39,
  "74o": 38,
  "64o": 37,
  "54o": 37,
  44: 60,
  "43s": 43,
  "42s": 42,
  A3o: 57,
  K3o: 50,
  Q3o: 47,
  J3o: 43,
  T3o: 40,
  "93o": 39,
  "83o": 38,
  "73o": 37,
  "63o": 36,
  "53o": 36,
  "43o": 35,
  33: 59,
  "32s": 41,
  A2o: 57,
  K2o: 50,
  Q2o: 47,
  J2o: 43,
  T2o: 40,
  "92o": 39,
  "82o": 38,
  "72o": 37,
  "62o": 36,
  "52o": 36,
  "42o": 35,
  "32o": 34,
  22: 55,
};

function shouldFold(hand) {
  let [card1, card2] = hand;
  let rank1 = card1[0];
  let suit1 = card1[1];
  let rank2 = card2[0];
  let suit2 = card2[1];

  let suited = suit1 === suit2 ? "s" : "o";
  let key1 = rank1 + rank2 + suited;
  let key2 = rank2 + rank1 + suited;
  let strength = handStrength[key1] || handStrength[key2] || 0;

  return strength;
}

function getWinrate(community, hand) {
  if (hand.length !== 2) {
    throw new Error("Hand must have exactly 2 cards.");
  }
  if (community.length === 0) {
    let strength = shouldFold(hand);
    if (strength == 0) {
      console.log("Folding hand", hand);
      return {winrate: 0, move: ["FOLD"]};
    }
    return {winrate: strength, move: ["PLAY"]};
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
