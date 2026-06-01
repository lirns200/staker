import Phaser from 'phaser';
import { io } from 'socket.io-client';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.otherPlayers = {};
        this.zombies = {};
    }

    init(data) {
        this.nickname = data.nickname || 'Unknown';
    }

    create() {
        // World setup
        this.cameras.main.setBackgroundColor('#0a0a05');
        this.physics.world.setBounds(-2000, -2000, 4000, 4000);
        
        // Groups
        this.bullets = this.physics.add.group();
        
        // Add a simple tiled floor (procedural)
        for (let x = -2000; x < 2000; x += 128) {
            for (let y = -2000; y < 2000; y += 128) {
                if (Math.random() > 0.1) {
                    this.add.image(x, y, 'floor').setAlpha(0.4).setOrigin(0);
                }
                if (Math.random() > 0.98) {
                    this.add.image(x + Math.random()*100, y + Math.random()*100, 'barrel');
                }
            }
        }

        // Socket.io connection
        this.socket = io(window.location.origin);

        this.socket.on('connect', () => {
            this.socket.emit('playerJoin', { nickname: this.nickname });
        });

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

        this.socket.on('otherPlayerShoot', (shootData) => {
            const bullet = this.bullets.create(shootData.x, shootData.y, 'bullet');
            this.physics.moveTo(bullet, shootData.targetX, shootData.targetY, 400);
            this.time.delayedCall(1000, () => bullet.destroy());
        });

        this.socket.on('playerDisconnected', (playerId) => {
            if (this.otherPlayers[playerId]) {
                if(this.otherPlayers[playerId].label) this.otherPlayers[playerId].label.destroy();
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
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player);
        
        // Nickname label
        this.player.label = this.add.text(playerInfo.x, playerInfo.y - 20, this.nickname, {
            fontSize: '12px',
            fill: '#0f0'
        }).setOrigin(0.5);

        // Shooting
        this.input.on('pointerdown', (pointer) => {
            this.shoot(pointer);
        });
    }

    addOtherPlayer(playerInfo) {
        const otherPlayer = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'player').setTint(0x8888ff);
        otherPlayer.id = playerInfo.id;
        otherPlayer.label = this.add.text(playerInfo.x, playerInfo.y - 20, playerInfo.nickname || 'Stalker', {
            fontSize: '12px',
            fill: '#fff'
        }).setOrigin(0.5);
        this.otherPlayers[playerInfo.id] = otherPlayer;
    }

    shoot(pointer) {
        if (!this.player) return;
        
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const bullet = this.bullets.create(this.player.x, this.player.y, 'bullet');
        
        this.physics.moveToObject(bullet, worldPoint, 400);
        
        // Destroy bullet after some time
        this.time.delayedCall(1000, () => bullet.destroy());

        this.socket.emit('playerShoot', {
            x: this.player.x,
            y: this.player.y,
            targetX: worldPoint.x,
            targetY: worldPoint.y
        });
    }

    update() {
        if (this.player) {
            let vx = 0;
            let vy = 0;
            const speed = 120;

            if (this.cursors.left.isDown || this.keys.A.isDown) vx = -speed;
            else if (this.cursors.right.isDown || this.keys.D.isDown) vx = speed;

            if (this.cursors.up.isDown || this.keys.W.isDown) vy = -speed;
            else if (this.cursors.down.isDown || this.keys.S.isDown) vy = speed;

            this.player.setVelocity(vx, vy);
            this.player.label.setPosition(this.player.x, this.player.y - 20);

            // Update other player labels
            Object.values(this.otherPlayers).forEach(p => {
                p.label.setPosition(p.x, p.y - 20);
            });

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
