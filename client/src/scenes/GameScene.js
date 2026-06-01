import Phaser from 'phaser';
import { io } from 'socket.io-client';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.otherPlayers = {};
        this.zombies = {};
    }

    create() {
        // World setup
        this.cameras.main.setBackgroundColor('#111');
        this.physics.world.setBounds(-2000, -2000, 4000, 4000);
        
        // Add a simple tiled floor (procedural)
        for (let x = -2000; x < 2000; x += 64) {
            for (let y = -2000; y < 2000; y += 64) {
                if (Math.random() > 0.05) {
                    const floor = this.add.image(x, y, 'floor').setAlpha(0.2).setOrigin(0);
                    floor.setTint(0x223322);
                }
            }
        }

        // Socket.io connection
        this.socket = io(window.location.origin);

        this.socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach((id) => {
                if (id === this.socket.id) {
                    this.addPlayer(players[id]);
                } else {
                    this.addOtherPlayer(players[id]);
                }
            });
        });

        this.socket.on('currentZombies', (zombieData) => {
            Object.keys(zombieData).forEach((id) => {
                this.addZombie(zombieData[id]);
            });
        });

        this.socket.on('zombiesMoved', (zombieData) => {
            Object.keys(zombieData).forEach((id) => {
                if (this.zombies[id]) {
                    this.zombies[id].setPosition(zombieData[id].x, zombieData[id].y);
                }
            });
        });

        this.socket.on('newPlayer', (playerInfo) => {
            this.addOtherPlayer(playerInfo);
        });

        this.socket.on('playerMoved', (playerInfo) => {
            if (this.otherPlayers[playerInfo.id]) {
                this.otherPlayers[playerInfo.id].setPosition(playerInfo.x, playerInfo.y);
            }
        });

        this.socket.on('playerDisconnected', (playerId) => {
            if (this.otherPlayers[playerId]) {
                this.otherPlayers[playerId].destroy();
                delete this.otherPlayers[playerId];
            }
        });

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        // Simple Mobile Controls (Virtual Joystick logic)
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                // Dragging logic can be added here
            }
        });
    }

    addPlayer(playerInfo) {
        this.player = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'player');
        this.player.setCollideWorldBounds(false);
        this.cameras.main.startFollow(this.player);
    }

    addOtherPlayer(playerInfo) {
        const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'player').setTint(0x8888ff);
        otherPlayer.id = playerInfo.id;
        this.otherPlayers[playerInfo.id] = otherPlayer;
    }

    addZombie(zombieInfo) {
        const zombie = this.add.sprite(zombieInfo.x, zombieInfo.y, 'zombie');
        zombie.id = zombieInfo.id;
        this.zombies[zombieInfo.id] = zombie;
    }

    update() {
        if (this.player) {
            let vx = 0;
            let vy = 0;
            const speed = 160;

            if (this.cursors.left.isDown || this.keys.A.isDown) vx = -speed;
            else if (this.cursors.right.isDown || this.keys.D.isDown) vx = speed;

            if (this.cursors.up.isDown || this.keys.W.isDown) vy = -speed;
            else if (this.cursors.down.isDown || this.keys.S.isDown) vy = speed;

            this.player.setVelocity(vx, vy);

            // Emit movement
            const x = this.player.x;
            const y = this.player.y;
            if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
                this.socket.emit('playerMovement', { x, y });
            }
            this.player.oldPosition = { x, y };
        }
    }
}
