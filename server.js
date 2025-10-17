// server.js
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let rooms = {};

io.on('connection', (socket) => {
  let roomId = null;
  let playerName = null;

  socket.on('join', ({room, name}) => {
    roomId = room;
    playerName = name;
    if (!rooms[roomId]) rooms[roomId] = [];
    if (rooms[roomId].length < 4) {
      rooms[roomId].push({id: socket.id, name: playerName});
      socket.join(roomId);
      io.to(roomId).emit('player-list', rooms[roomId]);
    } else {
      socket.emit('full');
    }
  });

  socket.on('game-event', (msg) => {
    // Broadcast game state changes, moves, bed destroyed, etc.
    socket.to(roomId).emit('game-event', msg);
  });

  socket.on('disconnect', () => {
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter(p => p.id !== socket.id);
      io.to(roomId).emit('player-list', rooms[roomId]);
      if (rooms[roomId].length === 0) delete rooms[roomId];
    }
  });
});

app.use(express.static('public')); // Serve your client files from ./public

server.listen(3000, () => {
  console.log('Bedwars server running on http://localhost:3000');
});
