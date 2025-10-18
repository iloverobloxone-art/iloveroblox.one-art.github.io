// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Serve your Three.js client (index.html, game.js, assets in /public)

const gameState = {
    players: {},
    teams: { red: [], blue: [], green: [], yellow: [] },
    blocks: [],
    beds: { red: true, blue: true, green: true, yellow: true }
    // You'd add more for resources, merchants, upgrades, etc.
};

io.on('connection', socket => {
    // Assign a team to new player (round robin for demo)
    let teamOrder = ['red', 'blue', 'green', 'yellow'];
    let teamName = teamOrder[Math.floor(Math.random() * 4)];
    gameState.teams[teamName].push(socket.id);
    gameState.players[socket.id] = {
        id: socket.id,
        team: teamName,
        position: { x: 0, y: 2, z: 15 },
        alive: true
    };
    socket.emit('init', { id: socket.id, team: teamName, gameState });

    // Broadcast new player to others
    socket.broadcast.emit('player-join', gameState.players[socket.id]);

    // Handle player position/movement updates
    socket.on('move', pos => {
        if (gameState.players[socket.id]) {
            gameState.players[socket.id].position = pos;
            socket.broadcast.emit('player-move', { id: socket.id, pos });
        }
    });

    // Handle block placement
    socket.on('place-block', data => {
        gameState.blocks.push(data); // data: { team, position }
        io.emit('update-block', data);
    });

    // Handle bed interactions
    socket.on('bed-break', team => {
        gameState.beds[team] = false;
        io.emit('bed-status', { team, broken: true });
    });

    // Disconnect
    socket.on('disconnect', () => {
        delete gameState.players[socket.id];
        for (let team in gameState.teams) {
            gameState.teams[team] = gameState.teams[team].filter(pid => pid !== socket.id);
        }
        io.emit('player-leave', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Bedwars 3D server running on http://localhost:3000');
});
