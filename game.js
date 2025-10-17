const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Teams, beds, players, shop items, etc.
let gameState = {
  teams: [
    { base: {x: 100, y: 100}, hasBed: true, players: [] },
    { base: {x: 800, y: 500}, hasBed: true, players: [] }
  ],
  bots: [],
  resources: [],
  shopItems: [
    {name: "Block", cost: 4},
    {name: "Sword", cost: 8},
    // ...
  ],
  players: [],
  gameMode: "singleplayer" // or "multiplayer"
};

// Add player
function addPlayer(name, isBot = false) {
  const teamIdx = gameState.players.length % 2;
  const player = {
    name,
    team: teamIdx,
    x: gameState.teams[teamIdx].base.x,
    y: gameState.teams[teamIdx].base.y,
    isBot,
    alive: true,
    hasBed: true
  };
  gameState.players.push(player);
  if (isBot) gameState.bots.push(player);
}

// Example bot routine
function botTick(bot) {
  // Move toward resources or enemy bed
  // Break bed if possible
  // Attack nearby players
  // Simple "AI" for demo
}

// Game loop
function gameLoop() {
  // Draw map, beds, shops, spawners
  // Update player/bot positions
  // Handle attacks, bed breaking
  // Win/lose detection
  // Shop UI/transactions
}

function startSingleplayer() {
  gameState = {/* reset game state */};
  addPlayer("You");
  addPlayer("AI_1", true); // Add as many bots as needed
  gameState.gameMode = "singleplayer";
  setInterval(gameLoop, 1000/60);
}

function startMultiplayer() {
  // Requires backend, but you can hotseat (2 keyboards)
  // Or plug a socket.io/simple Node server for remote real-time play
  gameState = {/* reset game state */};
  addPlayer("Player1");
  addPlayer("Player2");
  gameState.gameMode = "multiplayer";
  setInterval(gameLoop, 1000/60);
}
