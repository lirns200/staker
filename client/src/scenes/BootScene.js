import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Create placeholders for player and zombies
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Player placeholder (Green pixel guy)
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(0, 0, 16, 16);
        graphics.generateTexture('player', 16, 16);
        graphics.clear();

        // Zombie placeholder (Red pixel guy)
        graphics.fillStyle(0xff0000);
        graphics.fillRect(0, 0, 16, 16);
        graphics.generateTexture('zombie', 16, 16);
        graphics.clear();

        // Floor placeholder (Dark green)
        graphics.fillStyle(0x224422);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('floor', 32, 32);
        graphics.clear();

        this.load.on('complete', () => {
            this.scene.start('MainMenuScene');
        });
    }
}
