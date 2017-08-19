
BasicGame.MainMenu = function (game) {

  this.playButton = null;

};

BasicGame.MainMenu.prototype = {

  preload : function(){
    this.load.image('titlepage','assets/titlepage.png');
    this.load.audio('backgroundMusic',['assets/Civil_War_Drummer.wav']);
  },

  create: function () {

    this.add.sprite(0, 0, 'titlepage');
    this.audio();
    this.backgroundMusic();
    this.loadingText = this.add.text(this.game.width / 2, this.game.height / 2 + 80, "Press SPACEBAR or tap/click game to start", { font: "20px monospace", fill: "#fff" });
    this.loadingText.anchor.setTo(0.5, 0.5);
    this.add.text(this.game.width / 2, this.game.height - 90, "Copyright (c) 2014 SAE Students", { font: "12px monospace", fill: "#fff", align: "center"}).anchor.setTo(0.5, 0.5);
   

  },

  update: function () {

    if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || this.input.activePointer.isDown) {
      this.backgroundMusicSFX.destroy();
      this.startGame();     
    }
   

  },

  audio :function(){
    this.backgroundMusicSFX=this.add.audio('backgroundMusic');
  },

  backgroundMusic : function(){
    this.backgroundMusicSFX.play('',0,0.3,false);
  },

  startGame: function (pointer) {
    //  And start the actual game
    this.state.start('Game');
    }

};
