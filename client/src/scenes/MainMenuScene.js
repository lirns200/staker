import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.cameras.main.setBackgroundColor('#0a0a05');

        this.add.text(width / 2, height / 4, 'STALKER: PIXEL FALLOUT', {
            fontSize: '48px',
            fill: '#c0c090',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Nickname Input
        this.add.text(width / 2, height / 2 - 60, 'ENTER CODENAME:', { fontSize: '18px', fill: '#888' }).setOrigin(0.5);
        
        const nickname = localStorage.getItem('stalker_nickname') || 'Newbie_' + Math.floor(Math.random()*1000);
        const nameText = this.add.text(width / 2, height / 2 - 20, nickname, {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#333',
            padding: 10
        }).setOrigin(0.5).setInteractive();

        nameText.on('pointerdown', () => {
            const newName = prompt('Enter your codename:', nameText.text);
            if (newName) {
                nameText.setText(newName.substring(0, 12).toUpperCase());
                localStorage.setItem('stalker_nickname', nameText.text);
            }
        });

        const playButton = this.add.text(width / 2, height / 2 + 60, 'ENTER THE ZONE', {
            fontSize: '28px',
            fill: '#0f0',
            fontFamily: 'monospace',
            backgroundColor: '#1a331a',
            padding: 15
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerover', () => playButton.setStyle({ fill: '#fff' }))
          .on('pointerout', () => playButton.setStyle({ fill: '#0f0' }))
          .on('pointerdown', () => {
              this.scene.start('GameScene', { nickname: nameText.text });
          });

        this.add.text(width / 2, height - 30, 'WASD - Move | CLICK - Shoot', {
            fontSize: '14px',
            fill: '#555'
        }).setOrigin(0.5);
    }
}
