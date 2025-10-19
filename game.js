const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui');

// Room & game setup
let roomCount = 1;
let status = "playing";
const roomWidth = 440, roomHeight = 270;
const spawn = { x: 80, y: 160 };
let monsterRoom = Math.floor(Math.random() * 7) + 3; // monster between rooms 3-9
let monsterPresent = false;

// Player setup
let player = { x: spawn.x, y: spawn.y, r: 14, speed: 3, inHiding: false };
let controls = { left: false, up: false, right: false, down: false };

// Each room has random hiding spots
let hidingSpots = [];
function randomRoom() {
  hidingSpots = [];
  let n = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < n; ++i) {
    hidingSpots.push({
      x: 140 + 150*i + Math.random()*40, y: 150 + Math.random()*50,
      w: 38, h: 28, type: Math.random() < 0.5 ? "closet" : "bed"
    });
  }
}
randomRoom();

// Draw game frame
function drawRoom() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Room boundaries
  ctx.fillStyle = "#191d3e";
  ctx.fillRect(20, 40, roomWidth, roomHeight);

  // Door
  ctx.save();
  ctx.fillStyle = monsterPresent ? "#c1262c" : "#a77e55";
  ctx.strokeStyle = "#3f2c15";
  ctx.lineWidth = 5;
  ctx.fillRect(roomWidth - 20, roomHeight / 2 + 30, 28, 65);
  ctx.strokeRect(roomWidth - 20, roomHeight / 2 + 30, 28, 65);
  ctx.restore();
  // Door text
  ctx.font = "17px Arial";
  ctx.fillStyle = "#efc574";
  ctx.fillText("Door", roomWidth - 16, roomHeight / 2 + 62);

  // Hiding spots
  for (const hide of hidingSpots) {
    ctx.save();
    ctx.fillStyle = hide.type === "bed" ? "#407ea6" : "#564e36";
    ctx.fillRect(hide.x, hide.y, hide.w, hide.h);
    ctx.fillStyle = "#eee";
    ctx.font = "14px Arial";
    ctx.fillText(hide.type, hide.x + 3, hide.y + hide.h - 7);
    ctx.restore();
  }

  // Monster if present
  if (monsterPresent) {
    drawMonster(roomWidth / 2 + 70, roomHeight / 2 + 70);
  }

  // Player
  if (!player.inHiding) {
    drawPlayer(player.x, player.y);
  } else {
    ctx.save();
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#eef";
    ctx.fillText("Hiding...", 40, 72);
    ctx.restore();
  }

  // HUD
  ctx.save();
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "#eee";
  ctx.fillText("Room " + roomCount, 38, 74);
  ctx.restore();
}

// Draw player as circle
function drawPlayer(x, y) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, player.r, 0, Math.PI * 2);
  ctx.fillStyle = "#43d1a0";
  ctx.fill();
  // Eyes
  ctx.beginPath();
  ctx.arc(x - 5, y - 4, 2.5, 0, Math.PI * 2);
  ctx.arc(x + 5, y - 4, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "#191d3e";
  ctx.fill();
  ctx.restore();
}

// Monster drawing
function drawMonster(x, y) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 32, 0, Math.PI * 2);
  ctx.fillStyle = "#90164e";
  ctx.fill();
  // Eyes
  ctx.beginPath();
  ctx.arc(x - 10, y - 6, 7, 0, Math.PI * 2);
  ctx.arc(x + 10, y - 6, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  // Smile
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y + 10, 14, 0, Math.PI, false);
  ctx.stroke();
  ctx.restore();
}

// Main update loop
function updateGame() {
  if (status !== "playing") return;

  // Move player
  if (!player.inHiding && !monsterPresent) {
    let nextX = player.x, nextY = player.y;
    if (controls.left) nextX -= player.speed;
    if (controls.right) nextX += player.speed;
    if (controls.up) nextY -= player.speed;
    if (controls.down) nextY += player.speed;

    // Collisions with room boundaries (walls)
    if (nextX - player.r > 20 && nextX + player.r < 20 + roomWidth)
      player.x = nextX;
    if (nextY - player.r > 40 && nextY + player.r < 40 + roomHeight)
      player.y = nextY;

    // Prevent entering hiding spots directly
    for (const hide of hidingSpots) {
      if (
        player.x + player.r > hide.x &&
        player.x - player.r < hide.x + hide.w &&
        player.y + player.r > hide.y &&
        player.y - player.r < hide.y + hide.h
      ) {
        // Move player back
        player.x = spawn.x;
        player.y = spawn.y;
      }
    }
  }

  drawRoom();
  requestAnimationFrame(updateGame);
}
// User interface handling
function showControls() {
  ui.innerHTML =
    `Use <b>Arrow</b> or <b>WASD</b> keys to move.<br>
     Stand close to a hiding spot (bed/closet) and press <b>Space</b> to hide/unhide.<br>
     Reach the door (right side) to go to next room.<br>
     <b>Beware of monsters!</b>`;
}
function showGameOver() {
  ui.innerHTML = `<span style="color:#e44; font-weight:bold">A monster got you!<br><button onclick="restartGame()">Restart</button></span>`;
}
function showVictory() {
  ui.innerHTML = `<span style="color:#0ef; font-weight:bold">You hid and survived the monster!<br>
  <button onclick="nextRoom()">Next Room</button></span>`;
}
// Keyboard movement controls
window.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "a") controls.left = true;
  if (e.key === "ArrowRight" || e.key === "d") controls.right = true;
  if (e.key === "ArrowUp" || e.key === "w") controls.up = true;
  if (e.key === "ArrowDown" || e.key === "s") controls.down = true;

  // Hide/unhide if near hiding spot
  if (e.key === " ") {
    let inSpot = hidingSpots.some(hide =>
      player.x + player.r > hide.x &&
      player.x - player.r < hide.x + hide.w &&
      player.y + player.r > hide.y &&
      player.y - player.r < hide.y + hide.h
    );
    if (inSpot) player.inHiding = !player.inHiding;
    drawRoom();
  }
});
window.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key === "a") controls.left = false;
  if (e.key === "ArrowRight" || e.key === "d") controls.right = false;
  if (e.key === "ArrowUp" || e.key === "w") controls.up = false;
  if (e.key === "ArrowDown" || e.key === "s") controls.down = false;
});

// Door interaction and monster logic
function checkRoomEnd() {
  // Door region
  if (
    player.x + player.r > roomWidth - 20 &&
    player.y + player.r > roomHeight / 2 + 30 &&
    player.y - player.r < roomHeight / 2 + 95
  ) {
    if (monsterPresent) {
      if (player.inHiding) {
        status = "survived";
        showVictory();
      } else {
        status = "gameover";
        showGameOver();
      }
    } else {
      nextRoom();
    }
  }
}

// Game progression
function nextRoom() {
  roomCount++;
  player.x = spawn.x;
  player.y = spawn.y;
  player.inHiding = false;
  monsterPresent = false;
  status = "playing";
  randomRoom();

  if (roomCount === monsterRoom) {
    monsterPresent = true;
  }
  drawRoom();
  showControls();
  requestAnimationFrame(() => setTimeout(monsterTrigger, 1500));
}
function restartGame() {
  roomCount = 1;
  status = "playing";
  monsterRoom = Math.floor(Math.random() * 7) + 3;
  monsterPresent = false;
  player.x = spawn.x;
  player.y = spawn.y;
  player.inHiding = false;
  randomRoom();
  drawRoom();
  showControls();
  updateGame();
}
// Monster event (after monster appears)
function monsterTrigger() {
  if (status !== "playing" || !monsterPresent) return;
  // Give player time to hide or reach door
  let time = 2200;
  setTimeout(() => {
    if (status !== "playing") return;
    // If not hiding, game over!
    if (!player.inHiding) {
      status = "gameover";
      drawRoom();
      showGameOver();
    }
  }, time);
}

// On room entry
drawRoom();
showControls();
updateGame();

canvas.addEventListener("click", checkRoomEnd);
canvas.addEventListener("touchstart", checkRoomEnd);

setInterval(checkRoomEnd, 120);
