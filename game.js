// game.js
let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');

const TEAM_COLORS = ["red", "blue", "green", "yellow"];
const WOOL_FILES = {
  "red": "assets/wool_red.png",
  "blue": "assets/wool_blue.png",
  "green": "assets/wool_green.png",
  "yellow": "assets/wool_yellow.png"
};
const BED_FILES = {
  "red": "assets/bed_red.png",
  "blue": "assets/bed_blue.png",
  "green": "assets/bed_green.png",
  "yellow": "assets/bed_yellow.png"
};
const DEFAULT_SKIN = "assets/player_red.png"; // fallback

let assets = {};
let gameState = {
  players: [],
  teams: [],
  blocks: [],
  resources: [],
  shops: [],
  merchant: {x: 450, y: 300, img: "assets/merchant_skin.png"},
  mode: "singleplayer", // or 'multiplayer'
  customSkins: {}, // username: skin path
};

// ---- Asset Loader ----
function loadAssets(callback) {
  let toLoad = [];
  for (let color of TEAM_COLORS) {
    toLoad.push(WOOL_FILES[color]);
    toLoad.push(BED_FILES[color]);
  }
  toLoad.push(DEFAULT_SKIN);
  toLoad.push(gameState.merchant.img);

  let loaded = 0;
  toLoad.forEach(path => {
    let img = new Image();
    img.src = path;
    img.onload = () => {
      assets[path] = img;
      loaded++;
      if (loaded === toLoad.length) callback();
    };
  });
}

// ---- Player, Team, Shop ----
function createTeams() {
  gameState.teams = TEAM_COLORS.map((color, i) => ({
    name: color,
    bed: {x: 100 + 700 * (i % 2), y: 100 + 400 * Math.floor(i / 2), color: color},
    wool: WOOL_FILES[color],
    bedImg: BED_FILES[color],
    blocks: []
  }));
}

function addPlayer(username, teamIdx, skinPath, bot = false) {
  let team = gameState.teams[teamIdx];
  let player = {
    name: username,
    team: team.name,
    x: team.bed.x, y: team.bed.y,
    alive: true,
    hasBed: true,
    inventory: {wool: 16, sword: 1, iron: 0, gold: 0},
    skin: skinPath || DEFAULT_SKIN,
    bot: bot
  };
  gameState.players.push(player);
  return player;
}

// ---- Block Logic ----
function placeBlock(x, y, player) {
  let color = player.team;
  gameState.blocks.push({x, y, color, img: WOOL_FILES[color], placedBy: player.name});
}

// ---- Bed Logic ----
function destroyBed(bedColor) {
  let team = gameState.teams.find(t => t.name === bedColor);
  if (team) team.bed.destroyed = true;
  gameState.players.forEach(p => {
    if (p.team === bedColor) p.hasBed = false;
  });
}

// ---- Shop/Merchant ----
function openShop(player) {
  // Display shop UI, handle purchases (blocks, sword upgrades, etc)
  // For demo, auto-buy wool for iron:
  if (player.inventory.iron >= 4) {
    player.inventory.wool += 8;
    player.inventory.iron -= 4;
  }
}

// ---- Bot AI ----
function botBehavior(bot) {
  // Move toward center or nearest enemy bed
  bot.x += Math.random() > 0.5 ? 1 : -1;
  bot.y += Math.random() > 0.5 ? 1 : -1;

  // Place blocks randomly
  if (bot.inventory.wool > 0 && Math.random() < 0.02) {
    placeBlock(bot.x, bot.y, bot);
    bot.inventory.wool--;
  }

  // Attack/destroy enemy beds if nearby
  for (let team of gameState.teams) {
    if (team.name !== bot.team && !team.bed.destroyed &&
        Math.abs(bot.x - team.bed.x) < 30 && Math.abs(bot.y - team.bed.y) < 30) {
      destroyBed(team.name);
    }
  }

  // Go to merchant to buy wool if out
  if (bot.inventory.wool <= 0 && Math.abs(bot.x - gameState.merchant.x) < 40 && Math.abs(bot.y - gameState.merchant.y) < 40) {
    bot.inventory.iron += 4;
    openShop(bot);
  }
}

// ---- Custom Skin Support ----
function uploadSkin(username, filePath) {
  gameState.customSkins[username] = filePath;
  let player = gameState.players.find(p => p.name === username);
  if (player) player.skin = filePath;
}

// ---- Drawing ----
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw beds
  gameState.teams.forEach(t => {
    if (!t.bed.destroyed) {
      ctx.drawImage(assets[t.bedImg], t.bed.x - 16, t.bed.y - 16, 32, 32);
    }
  });

  // Draw blocks
  gameState.blocks.forEach(b => {
    ctx.drawImage(assets[b.img], b.x - 8, b.y - 8, 16, 16);
  });

  // Draw merchant
  ctx.drawImage(assets[gameState.merchant.img], gameState.merchant.x - 16, gameState.merchant.y - 16, 32, 32);

  // Draw players
  gameState.players.forEach(p => {
    let skinImg = assets[p.skin] || assets[DEFAULT_SKIN];
    ctx.drawImage(skinImg, p.x - 12, p.y - 12, 24, 24);
  });

  // HUD and info
  ctx.fillStyle = "#fff";
  ctx.font = "16px Segoe UI";
  gameState.players.forEach((p, idx) => {
    ctx.fillText(`${p.name} [${p.team}] Wool: ${p.inventory.wool} Iron: ${p.inventory.iron}`, 10, 24 + idx*24);
  });
}

// ---- Game Loop ----
function tick() {
  // Bot moves
  gameState.players.filter(p => p.bot).forEach(botBehavior);
  draw();
  requestAnimationFrame(tick);
}

// ---- Setup ----
function startSingleplayer() {
  gameState.players = [];
  createTeams();
  addPlayer("You", 0, DEFAULT_SKIN, false);

  // Add 3 bots, each to their own team, with separate color wool and skins
  for (let i = 1; i < TEAM_COLORS.length; i++) {
    addPlayer(`Bot${i}`, i, `assets/player_${TEAM_COLORS[i]}.png`, true);
  }
  gameState.mode = "singleplayer";
  loadAssets(tick);
}

function startMultiplayer(username, teamIdx, customSkin) {
  // Needs socket.io client code to join server, sync moves, beds, blocks, etc
  // For demo, single browser “local multiplayer”
  gameState.players = [];
  createTeams();
  addPlayer(username, teamIdx, customSkin, false);
  // Add other players - would be synced via server in real setup
  // ... 
  gameState.mode = "multiplayer";
  loadAssets(tick);
}

// -- Skin upload UI hook --
document.getElementById('skin-upload').onchange = function(e) {
  let file = e.target.files[0];
  let reader = new FileReader();
  reader.onload = function(evt) {
    uploadSkin("You", evt.target.result); // Update your skin
  };
  reader.readAsDataURL(file);
};

// -- Start game based on button --
window.startSingleplayer = startSingleplayer;
// For multiplayer, hook up with username, team selection & skin input

