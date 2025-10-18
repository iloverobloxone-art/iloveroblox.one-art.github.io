// game.js
let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');

const TEAM_COLORS = ["red", "blue", "green", "yellow"];
const WOOL_FILES = {
  "red": "assets/red_wool.png",
  "blue": "assets/blue_wool.png",
  "green": "assets/green_wool.png",
  "yellow": "assets/yellow_wool.png"
};
const BED_FILES = {
  "red": "assets/bed_red.png",
  "blue": "assets/bed_blue.png",
  "green": "assets/bed_green.png",
  "yellow": "assets/bed_yellow.png"
};
const ITEM_ICONS = {
  "iron": "assets/iron.png",
  "gold": "assets/gold.png",
  "diamond": "assets/diamond.png",
  "sword_iron": "assets/iron_sword.png",
  "fireball": "assets/fireball.png",
  "tnt": "assets/tnt.png"
};

let assets = {};
let gameState = {
  players: [],
  teams: [],
  blocks: [],
  resources: [],
  merchants: [
    {type: "personal", x: 420, y: 300, color: "#ffa500"},
    {type: "team", x: 480, y: 300, color: "#00ffd0"}
  ],
  mode: "singleplayer",
  diamonds: [],
};

function loadAssets(callback) {
  let toLoad = [];
  for (let color of TEAM_COLORS) {
    toLoad.push(WOOL_FILES[color]);
    toLoad.push(BED_FILES[color]);
  }
  Object.values(ITEM_ICONS).forEach(p => toLoad.push(p));
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

function createTeams() {
  gameState.teams = TEAM_COLORS.map((color, i) => ({
    name: color,
    bed: {x: 100 + 700 * (i % 2), y: 100 + 400 * Math.floor(i / 2), color: color},
    wool: WOOL_FILES[color],
    bedImg: BED_FILES[color],
    blocks: [],
    upgrades: {protection: false},
    diamonds: 0
  }));
}

function addPlayer(username, teamIdx, bot = false) {
  let team = gameState.teams[teamIdx];
  let player = {
    name: username,
    team: team.name,
    x: team.bed.x, y: team.bed.y,
    alive: true,
    hasBed: true,
    inventory: {wool: 16, sword: 1, iron: 0, gold: 0, fireball: 0, tnt: 0},
    bot: bot
  };
  gameState.players.push(player);
  return player;
}

function placeBlock(x, y, player) {
  let color = player.team;
  gameState.blocks.push({x, y, color, img: WOOL_FILES[color], placedBy: player.name});
}

function destroyBed(bedColor) {
  let team = gameState.teams.find(t => t.name === bedColor);
  if (team && !team.bed.destroyed) {
    team.bed.destroyed = true;
    gameState.players.forEach(p => { if (p.team === bedColor) p.hasBed = false; });
  }
}

function openShop(player) {
  // Cheaper item prices
  if (player.inventory.iron >= 2) { player.inventory.wool += 12; player.inventory.iron -= 2; }
  if (player.inventory.gold >= 2) { player.inventory.sword = 2; player.inventory.gold -= 2; }
  if (player.inventory.gold >= 3) { player.inventory.fireball += 1; player.inventory.gold -= 3; }
}

function openTeamUpgradeShop(team) {
  if (team.diamonds >= 2 && !team.upgrades.protection) { team.upgrades.protection = true; team.diamonds -= 2; }
}

function botBehavior(bot) {
  bot.x += Math.random() > 0.5 ? 1 : -1;
  bot.y += Math.random() > 0.5 ? 1 : -1;
  if (bot.inventory.wool > 0 && Math.random() < 0.02) { placeBlock(bot.x, bot.y, bot); bot.inventory.wool--; }
  for (let team of gameState.teams) {
    if (team.name !== bot.team && !team.bed.destroyed && Math.abs(bot.x - team.bed.x) < 30 && Math.abs(bot.y - team.bed.y) < 30) {
      destroyBed(team.name);
    }
  }
  let m = gameState.merchants[0];
  if (bot.inventory.wool <= 0 && Math.abs(bot.x - m.x) < 40 && Math.abs(bot.y - m.y) < 40) {
    bot.inventory.iron += 2;
    openShop(bot);
  }
}

function collectDiamonds(player) {
  for (let i = 0; i < gameState.diamonds.length; i++) {
    let d = gameState.diamonds[i];
    if (Math.abs(player.x - d.x) < 18 && Math.abs(player.y - d.y) < 18) {
      let team = gameState.teams.find(t => t.name === player.team);
      team.diamonds++;
      gameState.diamonds.splice(i, 1);
      i--;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Beds
  gameState.teams.forEach(t => {
    if (!t.bed.destroyed) ctx.drawImage(assets[t.bedImg], t.bed.x - 16, t.bed.y - 16, 32, 32);
  });
  // Blocks/wool
  gameState.blocks.forEach(b => ctx.drawImage(assets[b.img], b.x - 8, b.y - 8, 16, 16));
  // Merchants as circles
  gameState.merchants.forEach(m => {
    ctx.beginPath();
    ctx.arc(m.x, m.y, 16, 0, 2 * Math.PI);
    ctx.fillStyle = m.color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.font = "11px Segoe UI";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(m.type === "personal" ? "Shop" : "Upgrades", m.x, m.y + 28);
  });
  // Diamonds
  gameState.diamonds.forEach(d => ctx.drawImage(assets[ITEM_ICONS["diamond"]], d.x - 8, d.y - 8, 16, 16));
  // HUD info
  ctx.font = "16px Segoe UI";
  ctx.textAlign = "left";
  gameState.players.forEach((p, idx) => {
    ctx.fillStyle = p.alive ? "#fff" : "#999";
    ctx.fillText(`${p.name} [${p.team}] Wool:${p.inventory.wool} Iron:${p.inventory.iron} Gold:${p.inventory.gold} Fireball:${p.inventory.fireball} TNT:${p.inventory.tnt}`, 10, 24 + idx * 24);
  });
  ctx.textAlign = "right";
  gameState.teams.forEach((t, idx) => {
    ctx.fillStyle = "#fff";
    ctx.fillText(`[${t.name}] Diamonds:${t.diamonds} Protect:${t.upgrades.protection?"Y":"N"}`, 890, 24 + idx*24);
  });
}

function tick() {
  gameState.players.filter(p => p.bot).forEach(botBehavior);
  gameState.players.forEach(collectDiamonds);
  draw();
  requestAnimationFrame(tick);
}

function spawnDiamonds() {
  gameState.diamonds = [
    {x: 450, y: 70}, {x: 450, y: 530}, {x: 140, y: 300}, {x: 760, y: 300}
  ];
}

function startSingleplayer() {
  gameState.players = [];
  createTeams();
  addPlayer("You", 0, false);
  for (let i = 1; i < TEAM_COLORS.length; i++) { addPlayer(`Bot${i}`, i, true); }
  gameState.mode = "singleplayer";
  spawnDiamonds();
  loadAssets(tick);
}

function startMultiplayer() {
  gameState.players = [];
  createTeams();
  addPlayer("Player1", 0, false);
  addPlayer("Player2", 1, false);
  gameState.mode = "multiplayer";
  spawnDiamonds();
  loadAssets(tick);
}

window.startSingleplayer = startSingleplayer;
window.startMultiplayer = startMultiplayer;

// Simple merchant interaction: click near merchant to open shop or upgrade
canvas.onclick = function(e) {
  let rect = canvas.getBoundingClientRect();
  let mx = e.clientX - rect.left, my = e.clientY - rect.top;
  for (let m of gameState.merchants) {
    if (Math.abs(mx - m.x) < 30 && Math.abs(my - m.y) < 30) {
      let player = gameState.players.find(p => p.name === "You");
      if (!player) return;
      if (m.type === "personal") openShop(player);
      if (m.type === "team") {
        let team = gameState.teams.find(t => t.name === player.team);
        openTeamUpgradeShop(team);
      }
    }
  }
};
