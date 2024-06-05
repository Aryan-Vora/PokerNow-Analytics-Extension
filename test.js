const Hand = require("pokersolver").Hand;

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
  // Ensure hand has exactly 2 elements
  if (hand.length !== 2) {
    throw new Error("Hand must have exactly 2 cards.");
  }

  // Combine hand and community cards
  const allCards = hand.concat(community).map((card) => card.toUpperCase());

  // Find the best hand
  const playerBestHand = Hand.solve(allCards);

  // Initialize the deck and remove known cards
  let deck = createDeck();
  const knownCards = new Set(allCards);

  // Remove known cards from the deck
  deck = deck.filter((card) => !knownCards.has(card.toUpperCase()));

  const simulations = 1000;
  const handRanks = {};
  const winCounts = {};
  let overallWins = 0;

  for (let i = 0; i < simulations; i++) {
    // Make a copy of the deck to shuffle and draw cards from
    const tempDeck = shuffleDeck([...deck]);

    // Draw the required number of cards to complete the board
    const sample = tempDeck
      .slice(0, 5 - community.length)
      .map((card) => card.toUpperCase());
    const fullBoard = community.concat(sample);

    // Determine player's best hand
    const playerHand = Hand.solve(hand.concat(fullBoard));
    const rank = playerHand.name;

    if (!handRanks[rank]) {
      handRanks[rank] = 0;
      winCounts[rank] = 0;
    }
    handRanks[rank]++;

    // Simulate opponent's hand
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

  // Get the three most common hands
  const sortedHandRanks = Object.entries(handRanks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Calculate odds and win rate for each specific hand
  const results = sortedHandRanks.map(([handName, count]) => ({
    hand: handName,
    odds: ((count / simulations) * 100).toFixed(2),
    winrate: ((winCounts[handName] / count) * 100).toFixed(2),
  }));

  // Calculate overall win rate
  const overallWinrate = ((overallWins / simulations) * 100).toFixed(2);

  return {winrate: overallWinrate, hands: results};
}

// Example usage
const hand = ["Ah", "Kh"];
const community = ["Th", "2h", "6d"];

const results = getWinrate(community, hand);
console.log(results);
