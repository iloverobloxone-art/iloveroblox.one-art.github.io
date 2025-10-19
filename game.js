const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui');

let roomCount = 1;
let status = "playing";
let monsterRoom = Math.floor(Math.random() * 7) + 3; // monster between rooms 3-9

function drawRoom() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw Room Background
  ctx.fillStyle = "#191d3e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Room Number Text
  ctx.font = "bold 28px Arial";
  ctx.fillStyle = "#eee";
  ctx.fillText("Room " + roomCount, 28, 45);
  // Draw Door
  drawDoor(canvas.width/2 - 30, 120, status === "monster");
  // If monster, draw monster
  if (status === "monster") {
    drawMonster(canvas.width/2 + 70, 130);
    // Show game over
    ui.innerHTML = `<span style="color:#e44; font-weight:bold">A monster attacked! Game Over.<br><button onclick="restartGame()">Restart</button></span>`;
  } else {
    ui.innerHTML = `<button onclick="nextRoom()">Open Door</button>`;
  }
}

// Draws a basic brown door; if danger, highlights in red
function drawDoor(x, y, isMonster = false) {
  ctx.save();
  ctx.fillStyle = isMonster ? "#ae2d26" : "#a77e55";
  ctx.strokeStyle = "#3f2c15";
  ctx.lineWidth = 6;
  ctx.fillRect(x, y, 60, 120); // door
  ctx.strokeRect(x, y, 60, 120); // border
  // Doorknob
  ctx.beginPath();
  ctx.arc(x + 48, y + 65, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#f8ce44";
  ctx.fill();
  ctx.restore();
  // Optional: a key slot or sign
  if (!isMonster) {
    ctx.fillStyle = "#2a2c2f";
    ctx.fillRect(x + 24, y + 94, 12, 5);
  }
}

// Draws a simple monster
function drawMonster(x, y) {
  // Head
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

function nextRoom() {
  roomCount++;
  if (roomCount === monsterRoom) {
    status = "monster";
  }
  drawRoom();
}

function restartGame() {
  roomCount = 1;
  status = "playing";
  monsterRoom = Math.floor(Math.random() * 7) + 3;
  drawRoom();
}

// Initial draw
drawRoom();
