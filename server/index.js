const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static(path.join(__dirname, '../client/dist')));

const players = {};
const zombies = {};

// Create some initial zombies
for (let i = 0; i < 20; i++) {
    const id = 'zombie_' + i;
    zombies[id] = {
        id,
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        health: 100
    };
}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('playerJoin', (data) => {
        players[socket.id] = {
            id: socket.id,
            nickname: data.nickname || 'Stalker',
            x: 0,
            y: 0,
            rotation: 0,
            health: 100
        };

        // Send current state to the new player
        socket.emit('currentPlayers', players);
        socket.emit('currentZombies', zombies);

        // Notify others about the new player
        socket.broadcast.emit('newPlayer', players[socket.id]);
    });

    socket.on('playerShoot', (shootData) => {
        socket.broadcast.emit('otherPlayerShoot', {
            id: socket.id,
            ...shootData
        });
    });

    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            players[socket.id].rotation = movementData.rotation;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

// Zombie AI Loop
setInterval(() => {
    Object.values(zombies).forEach(zombie => {
        let nearestPlayer = null;
        let minDist = 500;

        Object.values(players).forEach(player => {
            const dist = Math.sqrt((player.x - zombie.x)**2 + (player.y - zombie.y)**2);
            if (dist < minDist) {
                minDist = dist;
                nearestPlayer = player;
            }
        });

        if (nearestPlayer) {
            const dx = nearestPlayer.x - zombie.x;
            const dy = nearestPlayer.y - zombie.y;
            const angle = Math.atan2(dy, dx);
            zombie.x += Math.cos(angle) * 1.5;
            zombie.y += Math.sin(angle) * 1.5;
        } else {
            // Random wander
            zombie.x += (Math.random() - 0.5) * 2;
            zombie.y += (Math.random() - 0.5) * 2;
        }
    });
    io.emit('zombiesMoved', zombies);
}, 100);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
