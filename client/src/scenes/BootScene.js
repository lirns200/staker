import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Create placeholders for player and zombies
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Player: Stalker-like (Tan/Brown colors)
        graphics.fillStyle(0x4d4d33); // Jacket
        graphics.fillRect(0, 0, 16, 16);
        graphics.fillStyle(0x222211); // Backpack
        graphics.fillRect(0, 4, 4, 8);
        graphics.fillStyle(0xffdbac); // Face
        graphics.fillRect(6, 2, 6, 6);
        graphics.generateTexture('player', 16, 16);
        graphics.clear();

        // Zombie: Mutant/Ghouls (Pale Green/Grey)
        graphics.fillStyle(0x667766);
        graphics.fillRect(0, 0, 16, 16);
        graphics.fillStyle(0x330000); // Glowing eyes
        graphics.fillRect(4, 4, 2, 2);
        graphics.fillRect(10, 4, 2, 2);
        graphics.generateTexture('zombie', 16, 16);
        graphics.clear();

        // Bullet
        graphics.fillStyle(0xffff00);
        graphics.fillRect(0, 0, 4, 2);
        graphics.generateTexture('bullet', 4, 2);
        graphics.clear();

        // Wasteland Floor (Dirty Green/Grey)
        graphics.fillStyle(0x2b2b1a);
        graphics.fillRect(0, 0, 64, 64);
        for(let i=0; i<20; i++) {
            graphics.fillStyle(0x1a1a0d);
            graphics.fillRect(Math.random()*64, Math.random()*64, 2, 2);
        }
        graphics.generateTexture('floor', 64, 64);
        graphics.clear();

        // Rusty Barrels (Prop)
        graphics.fillStyle(0x7a3a2a);
        graphics.fillRect(0, 0, 16, 20);
        graphics.fillStyle(0x4a1a0a);
        graphics.fillRect(0, 4, 16, 2);
        graphics.fillRect(0, 14, 16, 2);
        graphics.generateTexture('barrel', 16, 20);
        graphics.clear();

        this.load.on('complete', () => {
            this.scene.start('MainMenuScene');
        });
    }
}
