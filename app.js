window.onload = function() {

  //  Create your Phaser game and inject it into the gameContainer div. 
  var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'gameContainer');

  //  Add the States your game has.
  game.state.add('Boot', BasicGame.Boot);
  game.state.add('Preloader', BasicGame.Preloader);
  game.state.add('MainMenu', BasicGame.MainMenu);
  game.state.add('Game', BasicGame.Game);

  //  Now start the Boot state.
  game.state.start('Boot');

};
