import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, height / 3, 'PIXEL ZOMBIE ONLINE', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        const playButton = this.add.text(width / 2, height / 2, 'START SURVIVAL', {
            fontSize: '24px',
            fill: '#0f0',
            fontFamily: 'monospace'
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => this.scene.start('GameScene'));

        this.add.text(width / 2, height - 50, 'Use WASD or Touch to Move', {
            fontSize: '16px',
            fill: '#888',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
    }
}
