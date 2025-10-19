// game.js
let roomCount = 0;
let monsterRoom = Math.floor(Math.random() * 10) + 3;

function renderRoom() {
  const game = document.getElementById('game');
  game.innerHTML = '';
  const room = document.createElement('div');
  room.className = 'room';
  if (roomCount === monsterRoom) {
    room.innerHTML = `<h2>Room ${roomCount}</h2><p>A monster attacks! Game Over.</p><button class="door" onclick="restartGame()">Restart</button>`;
  } else {
    room.innerHTML = `<h2>Room ${roomCount}</h2><p>You are safe... for now.</p><button class="door" onclick="nextRoom()">Open Door</button>`;
  }
  game.appendChild(room);
}
function nextRoom() {
  roomCount++;
  renderRoom();
}
function restartGame() {
  roomCount = 0;
  monsterRoom = Math.floor(Math.random() * 10) + 3;
  renderRoom();
}
renderRoom();
