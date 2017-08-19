var BasicGame = {
  DESERT_SCROLL_SPEED: 12,
  PLAYER_SPEED: 300,
  ENEMY_MIN_Y_VELOCITY: 30,
  ENEMY_MAX_Y_VELOCITY: 60,
  SHOOTER_MIN_VELOCITY: 20,
  SHOOTER_MAX_VELOCITY: 50,
  BOSS_Y_VELOCITY: 15,
  BOSS_X_VELOCITY: 200,
  BULLET_VELOCITY: 500,
  ROCKET_VELOCITY: 250,
  ENEMY_BULLET_VELOCITY: 150,
  POWERUP_VELOCITY: 100,

  ENEMY_DELAY: 10000,
  SHOOTER_DELAY: Phaser.Timer.SECOND * 3,

  SHOT_DELAY: 400,
  SHOOTER_SHOT_DELAY: Phaser.Timer.SECOND * 2,
  BOSS_SHOT_DELAY: Phaser.Timer.SECOND,

  ENEMY_HEALTH: 3,
  SHOOTER_HEALTH: 4,
  BOSS_HEALTH: 250,

  BULLET_DAMAGE: 2,
  ROCKET_DAMAGE: 10,

  ENEMY_REWARD: 100,
  SHOOTER_REWARD: 300,
  BOSS_REWARD: 5000,
  POWERUP_REWARD: 50,

  ENEMY_DROP_RATE: 0.3,
  SHOOTER_DROP_RATE: 0.5,
  BOSS_DROP_RATE: 0,

  PLAYER_EXTRA_LIVES: 3,
  PLAYER_POWER_UP:0,
  PLAYER_GHOST_TIME: Phaser.Timer.SECOND * 3,

  INSTRUCTION_EXPIRE: Phaser.Timer.SECOND * 10,
  RETURN_MESSAGE_DELAY: Phaser.Timer.SECOND * 2
};

BasicGame.Boot = function (game) {

};

BasicGame.Boot.prototype = {

  preload: function () {

    //  Here we load the assets required for our preloader (in this case a loading bar)
    this.load.image('preloaderBar', 'assets/preloader-bar.png');

  },

  create: function () {

    // recommend setting this to 1
    this.input.maxPointers = 1;

    //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
    
    if (this.game.device.desktop) {
      //  If you have any desktop specific settings, they can go in here
    } else {
      //  Same goes for mobile settings.
      //  In this case we're saying "scale the game, no lower than 480x260 and no higher than 1024x768"
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.scale.setMinMax(480, 260, 1024, 768);
      this.scale.forceLandscape = true;
    }
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.scale.setScreenSize(true);

    //  By this point the preloader assets have loaded to the cache, we've set the game settings    
    this.state.start('Preloader');

  }

};
