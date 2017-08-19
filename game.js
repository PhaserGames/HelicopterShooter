
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {
  
  preload:function() {
    this.load.image('desert','assets/desert_bg.png');
    this.load.image('rocket','assets/rocket_big.png');
    this.load.image('bullet','assets/bullet.png');
    this.load.image('enemyBullet','assets/enemy_bullet.png');
    this.load.image('rocket_icn','assets/rocket_pow.png');
    this.load.spritesheet('player','assets/player.png',120,120);
    this.load.spritesheet('boss','assets/planeEnemy.png',71,71);
    this.load.spritesheet('canonEnemy','assets/canon.png',15,30);
    this.load.spritesheet('hammerEnemy','assets/hammer.png',40,40);
    this.load.spritesheet('explosion','assets/explosion.png',71,71);
    this.load.audio('explosion',['assets/blast_heavy.mp3']);
    this.load.audio('rocketLaunch',['assets/comedy_missle_launch.mp3']);
    this.load.audio('bulletFire',['assets/submachine_gun.mp3']);
    this.load.audio('shieldHit',['assets/shield_impact.mp3']);
    this.load.audio('enemyFire',['assets/remington_700.mp3']);
    this.load.audio('bossFire',['assets/high_powered_pistol.mp3']);
    this.load.audio('playerBossExplosion',['assets/playerboss_explosion.mp3']);
    this.load.audio('powerUp',['assets/rifle_winc.mp3']);    
    this.load.audio('playerFly',['assets/helicopter_loop.wav']);
    this.load.audio('bossFly',['assets/jet_loop.wav']);
    this.load.audio('success',['assets/success.wav']);
  },

  create: function () {

    this.setupBackground();
    this.setupPlayer();
    this.setupEnemies();
    this.setupBullets();
    this.setupRockets();
    this.setupExplosions();
    this.setupPlayerIcons();
    this.setupText(); 
    this.setupAudio();
    this.backgroundMusic();

    //KEYBOARD CONTROLS
    this.cursors=this.input.keyboard.createCursorKeys();//funkcija koja vraca kontrole za strelice na testaturi   


  },// END CREATE

  update: function () {

    this.Collisions();
    this.Enemies();
    this.enemyFire();
    this.PlayerInput();
    this.Delay();    

  },//END UPDATE

  // render:function(){
  //   this.game.debug.body(this.player);
   

  // },

  //------------------------CREATE FUNCTION RELATED--------------------------------------------------------------------------------

  setupBackground : function(){
     //BACKGROUND
    this.desert = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'desert');
    this.desert.autoScroll(0,BasicGame.DESERT_SCROLL_SPEED);//uvijek je bolje stavljati konstante umjesto hard-codinga zbog memorije, konstante u boot.js
  },

  backgroundMusic : function(){
    this.playerFlySFX.play('',0,0.3,true); 
  },

  setupPlayer : function(){
    //PLAYER
    this.player=this.add.sprite(this.game.width/2,this.game.height-60,'player');
    this.player.anchor.setTo(0.5,0.5);
    this.player.animations.add('fly',[0,1,2],20,true);
    this.player.animations.add('ghost',[3,0,3,1],20,true);
    this.player.play('fly');    
    this.physics.enable(this.player,Phaser.Physics.ARCADE);
    this.player.speed=BasicGame.PLAYER_SPEED;//dajemo brzinu playeru
    this.player.body.collideWorldBounds = true;// da ne moze player izaci iz ekrana
    this.player.body.setSize(20,20,0,-5);// namjestavam hitbox svoj
    this.rocketLevel=0;//postavljam broj raketa kod playera
  },


  setupEnemies : function(){
    //ENEMY HAMMER------------------------------------- 
    this.enemyPool=this.add.group();
    this.enemyPool.enableBody=true;
    this.enemyPool,physicsBodyType=Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(20,'hammerEnemy');
    this.enemyPool.setAll('anchor.x',0.5);
    this.enemyPool.setAll('anchor.y',0.5);
    this.enemyPool.setAll('outOfBoundsKill',true);
    this.enemyPool.setAll('checkWorldBounds',true);
    this.enemyPool.setAll('reward',BasicGame.ENEMY_REWARD,false,false,0,true);
    this.enemyPool.setAll('dropRate',BasicGame.ENEMY_DROP_RATE,false,false,0,true);//ovo stavljamo da nam se poveca sansa da dobijemo power up nakon ubijanja enemya za 30%
    //animacija za svaki sprite
    this.enemyPool.forEach(function(enemy){
      enemy.animations.add('drive',[0,1,2],20,true);
      enemy.animations.add('hit',[3, 1 , 3, 2],20,false);
      enemy.events.onAnimationComplete.add(function(e){
        e.play('drive');
      },this);
    });

    //intezija hammera
    this.nextEnemyAt=0;
    this.enemyDelay=BasicGame.ENEMY_DELAY;


    //ENEMY CANON---------------------------------------- 
    this.shooterPool=this.add.group();
    this.shooterPool.enableBody=true;
    this.shooterPool,physicsBodyType=Phaser.Physics.ARCADE;
    this.shooterPool.createMultiple(2,'canonEnemy');
    this.shooterPool.setAll('anchor.x',0.5);
    this.shooterPool.setAll('anchor.y',0.5);
    this.shooterPool.setAll('outOfBoundsKill',true);
    this.shooterPool.setAll('checkWorldBounds',true);
    this.shooterPool.setAll('reward',BasicGame.SHOOTER_REWARD,false,false,0,true);
    this.shooterPool.setAll('dropRate',BasicGame.SHOOTER_DROP_RATE,false,false,0,true);//ovo stavljamo da nam se poveca sansa da dobijemo power up nakon ubijanja shootera za 50%

    //animacija za svaki sprite
    this.shooterPool.forEach(function(enemy){
      enemy.animations.add('drive',[0,1,2],20,true);
      enemy.animations.add('hit',[3, 1 , 3, 2],20,false);
      enemy.events.onAnimationComplete.add(function(e){
        e.play('drive');
      },this);
    });

    //intezija aviona
    this.nextShooterAt=this.time.now + Phaser.Timer.SECOND * 10;
    this.shooterDelay=BasicGame.SHOOTER_DELAY;



    //ENEMY BOSS---------------------------------------- 
    this.bossPool=this.add.group();
    this.bossPool.enableBody=true;
    this.bossPool,physicsBodyType=Phaser.Physics.ARCADE;
    this.bossPool.createMultiple(1,'boss');
    this.bossPool.setAll('anchor.x',0.5);
    this.bossPool.setAll('anchor.y',0.5);
    this.bossPool.setAll('outOfBoundsKill',true);
    this.bossPool.setAll('checkWorldBounds',true);
    this.bossPool.setAll('reward',BasicGame.BOSS_REWARD,false,false,0,true);
    this.bossPool.setAll('dropRate',BasicGame.BOSS_DROP_RATE,false,false,0,true);//ovo stavljam da ne mozemo dobiti vise power_up nakon ubijanja bossa

    //animacija za svaki sprite
    this.bossPool.forEach(function(enemy){
      enemy.animations.add('fly',[0,1,2],20,true);
      enemy.animations.add('hit',[3, 1 , 3, 2],20,false);
      enemy.events.onAnimationComplete.add(function(e){
        e.play('fly');
      },this);
    });

    //postavljam da boss dodje sa vrha i da bude ispod scorelinea
    this.boss=this.bossPool.getTop();   
    this.bossApproaching=false;
  },

  setupBullets : function(){
    //PLAYER BULLET
    // dodaj prazan sprite nasoj grupi, grupe su bolje za koristenje od arraya zbog koristenja memorije  
    this.bulletPool=this.add.group();

    //dajem fiziku cijeloj grupi
    this.bulletPool.enableBody=true;
    this.bulletPool.physicsBodyType=Phaser.Physics.ARCADE;

    //Dodajem 100 bulleta nasoj grupi,funkcija createMutiple odmah postavlja uvjete kiling/dead koji jos ne postoje
    this.bulletPool.createMultiple(100, 'bullet');

    //postavljam polaznu tocku cijeloj grupi
    this.bulletPool.setAll('anchor.x',0.5);
    this.bulletPool.setAll('anchor.y',0.5);

    //Micem iz memorije bullet cim izadje iz ekrana
    this.bulletPool.setAll('outOfBoundsKill',true);
    this.bulletPool.setAll('checkWorldBounds',true);

    //intezitet pucanja bulleta
    this.nextShotAt=0;
    this.shotDelayBullet=BasicGame.SHOT_DELAY; 


    //ENEMY BULLET
    this.enemyBulletPool = this.add.group();
    this.enemyBulletPool.enableBody = true;
    this.enemyBulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyBulletPool.createMultiple(100, 'enemyBullet');
    this.enemyBulletPool.setAll('anchor.x',0.5);
    this.enemyBulletPool.setAll('anchor.y',0.5);
    this.enemyBulletPool.setAll('outOfBoundsKill',true);
    this.enemyBulletPool.setAll('checkWorldBounds',true);
    this.enemyBulletPool.setAll('reward',0,false,false,0,true);
  },

  setupRockets : function(){
    //ROCKET
    // dodaj prazan sprite nasoj grupi, grupe su bolje za koristenje od arraya zbog koristenja memorije  
    this.rocketPool=this.add.group();

    //dajem fiziku cijeloj grupi
    this.rocketPool.enableBody=true;
    this.rocketPool.physicsBodyType=Phaser.Physics.ARCADE;

    //Dodajem 20 rockets nasoj grupi,funkcija createMutiple odmah postavlja uvjete kiling/dead koji jos ne postoje
    this.rocketPool.createMultiple(20,'rocket');

    //postavljam polaznu tocku cijeloj grupi
    this.rocketPool.setAll('anchor.x',0.5);
    this.rocketPool.setAll('anchor.y',0.5);

    //Micem iz memorije rocket cim izadje iz ekrana
    this.rocketPool.setAll('outOfBoundsKill',true);
    this.rocketPool.setAll('checkWorldBounds',true);


    //intezitet pucanja rocketa
    this.nextShotAt=0;
    this.shotDelayRocket=1000; 
  },

  setupExplosions : function(){
    //EXPLOSIONS
    this.explosionPool=this.add.group();
    this.explosionPool.enableBody=true;
    this.explosionPool.physicsBodyType=Phaser.Physics.ARCADE;
    this.explosionPool.createMultiple(100,'explosion');
    this.explosionPool.setAll('anchor.x',0.5);
    this.explosionPool.setAll('anchor.y',0.5);
    this.explosionPool.forEach(function(explosion){
      explosion.animations.add('boom');
    });
  },

  setupText : function(){
    //INSTRUCTION MESSAGE
    this.instructions=this.add.text(this.game.width/2,this.game.height-100,
      'Use Arrow Keys to Move, Press SPACEBAR to Fire Bullets\n'+
      'Press Q to Fire Rockets',
      {font:'20px monospace',fill:'#283D2D',align:'center'}
    );
    this.instructions.anchor.setTo(0.5,0.5);
    this.instExpire=this.time.now + BasicGame.INSTRUCTION_EXPIRE;

    this.score=0;
    this.scoreText=this.add.text(
      this.game.width/2,30,''+this.score,
      {font:'19px monospace',fill:'#BF1A1A',align:'center'}
    );
    this.scoreText.anchor.setTo( 0.5, 0.5);
  },

  setupPlayerIcons : function(){
    //ZIVOTI PLAYERA
    this.lives=this.add.group();
    //location first life icon
    var firstLifeIconX=this.game.width-40-(BasicGame.PLAYER_EXTRA_LIVES*30);
    for(var i=0; i<BasicGame.PLAYER_EXTRA_LIVES; i++){
      var life=this.lives.create(firstLifeIconX + (50*i),30,'player');
      life.scale.setTo(0.5,0.5);//player sprite /2
      life.anchor.setTo(0.5,0.5);
    }

    //POWER_UP ROCKET
    this.powerUpPoll=this.add.group();
    this.powerUpPoll.enableBody=true;
    this.powerUpPoll.physicsBodyType=Phaser.Physics.ARCADE;
    this.powerUpPoll.createMultiple(2,'rocket_icn');
    this.powerUpPoll.setAll('anchor.x',0.5);
    this.powerUpPoll.setAll('anchor.y',0.5);
    this.powerUpPoll.setAll('outOfBoundsKill',true);
    this.powerUpPoll.setAll('checkWorldBounds',true);
    this.powerUpPoll.setAll(
      'reward',BasicGame.POWERUP_REWARD,false,false,0,true
    );

  },


  setupAudio : function(){
    this.explosionSFX=this.add.audio('explosion');
    this.rocketLaunchSFX=this.add.audio('rocketLaunch');
    this.bulletFireSFX=this.add.audio('bulletFire');
    this.shieldHitSFX=this.add.audio('shieldHit');
    this.enemyFireSFX=this.add.audio('enemyFire');
    this.bossFireSFX=this.add.audio('bossFire');
    this.playerBoss_explosionSFX=this.add.audio('playerBossExplosion');
    this.powerUpSFX=this.add.audio('powerUp');
    this.backgroundMusicSFX=this.add.audio('backgroundMusic');
    this.playerFlySFX=this.add.audio('playerFly');
    this.bossFlySFX=this.add.audio('bossFly');
    this.successSFX=this.add.audio('success');
  },

  
   
 

  //------------------------UPDATE FUNCTION RELATED--------------------------------------------------------------------------------

  Collisions : function(){
    //ROCKET VS HAMMER 
    this.physics.arcade.overlap(
      this.rocketPool,this.enemyPool,this.enemyHit_rocket,null,this
    );

    //BULLET VS HAMMER
    this.physics.arcade.overlap(
      this.bulletPool,this.enemyPool,this.enemyHit_bullet,null,this
    );

    //BULLET VS SHOOTER
    this.physics.arcade.overlap(
      this.bulletPool,this.shooterPool,this.enemyHit_bullet,null,this
    );

    //ROCKET VS SHOOTER
    this.physics.arcade.overlap(
      this.rocketPool,this.shooterPool,this.enemyHit_rocket,null,this
    );

    //PLAYER VS ENEMY BULLET
    this.physics.arcade.overlap(
      this.player,this.enemyBulletPool,this.playerHit,null,this
    );

    //PLAYER VS POWER_UP
    this.physics.arcade.overlap(
      this.player,this.powerUpPoll,this.playerPowerUp,null,this
    );

    //BOSS VS BULLETS BEFORE POSITION
    if(this.bossApproaching===false){
       this.physics.arcade.overlap(
        this.bulletPool,this.bossPool,this.enemyHit_bullet,null,this
      );
    };

    //BOSS VS ROCKETS BEFORE POSITION
    if(this.bossApproaching===false){
       this.physics.arcade.overlap(
        this.rocketPool,this.bossPool,this.enemyHit_rocket,null,this
      );
    };

    //PLAYER VS BOSS
    this.physics.arcade.overlap(
      this.player,this.bossPool,this.playerHit,null,this
    );

  },

  Enemies : function(){
    //STVARANJE ENEMYA U POOLU
    if(this.nextEnemyAt<this.time.now && this.enemyPool.countDead()>0){
      this.nextEnemyAt=this.time.now+this.enemyDelay;
      var enemy=this.enemyPool.getFirstExists(false);
      //random lokacija na vrhu ekrana
      enemy.reset(this.rnd.integerInRange(20,this.game.width-20),0,enemy.health=2);//buil in random number geberator,zovem iz boota
      //odredjivanje brzine
      enemy.body.velocity.y=this.rnd.integerInRange(BasicGame.ENEMY_MIN_Y_VELOCITY,BasicGame.ENEMY_MAX_Y_VELOCITY); 
      //animacija
      enemy.play('drive');    
    }

      //STVARANJE SHOOTERA U POOLU
      if(this.nextShooterAt < this.time.now && this.shooterPool.countDead()>0){
        this.nextShooterAt = this.time.now + this.shooterDelay;
        var shooter= this.shooterPool.getFirstExists(false);

      //dodaj na random lokaciju na vrhu ekrana
      shooter.reset(
        this.rnd.integerInRange(10,this.game.width-20),0,
        BasicGame.SHOOTER_HEALTH 
      );

      //pucaj na metu pri dnu
      var target=this.rnd.integerInRange(20,this.game.width-20);

      //idi do mete i rortiraj sprajt
      shooter.rotation=this.physics.arcade.moveToXY(//slicna funkcija kao movetoPoiner(), mice pre loakciji u worldu
        shooter,target,this.game.height,
        this.rnd.integerInRange(
          BasicGame.SHOOTER_MIN_VELOCITY,BasicGame.SHOOTER_MAX_VELOCITY
        )
      )-Math.PI/2;//ovo sam dodao da se ne micu na desno nego naprema dolje (90 stupnjeva)
      shooter.play('drive');

      //svaki shooter ima svoj tajmer za pucanje
      shooter.nextShotAt=0;
    }
  },

  enemyFire : function(){
    //CANONS FIRE------------------------------------------------------------------
    this.shooterPool.forEachAlive(function(enemy){
      if(this.time.now > enemy.nextShotAt && this.enemyBulletPool.countDead() > 0){
        var bullet = this.enemyBulletPool.getFirstExists(false);
        bullet.reset(enemy.x,enemy.y);
        this.physics.arcade.moveToObject(
          bullet,this.player,BasicGame.ENEMY_BULLET_VELOCITY
        );
        enemy.nextShotAt = this.time.now + BasicGame.SHOOTER_SHOT_DELAY;
        this.enemyFireSFX.play();
      }
    },this);


    //BOSS FIRE--------------------------------------------------------------------

    if(this.bossApproaching===false && this.boss.alive && this.boss.nextShotAt < this.time.now && this.enemyBulletPool.countDead() >=10){

      this.boss.nextShotAt = this.time.now + BasicGame.BOSS_SHOT_DELAY;
      this.bossFlySFX.play('',0,0.3,true);
      this.bossFireSFX.play();

      for(var i=0; i<5;i++){
        //2 bullet odjednom
        var leftBullet=this.enemyBulletPool.getFirstExists(false);
        leftBullet.reset(this.boss.x-10-i*10,this.boss.y+20);
        var rightBullet=this.enemyBulletPool.getFirstExists(false);
        rightBullet.reset(this.boss.x+10+i*10,this.boss.y+20);

        if(this.boss.health > 100){
         //ciljaj direktno u playera
         this.physics.arcade.moveToObject(
            leftBullet,this.player,BasicGame.ENEMY_BULLET_VELOCITY
          );
         this.physics.arcade.moveToObject(
          rightBullet,this.player,BasicGame.ENEMY_BULLET_VELOCITY
         );  
        }else{
         //ciljaj malo dalje od centra playera
         this.physics.arcade.moveToXY(
          leftBullet,this.player.x-i*100,this.player.y,BasicGame.ENEMY_BULLET_VELOCITY
         );
         this.physics.arcade.moveToXY(
          rightBullet,this.player.x+i*100,this.player.y,BasicGame.ENEMY_BULLET_VELOCITY
         );
        }
      }
    }
  },

  PlayerInput : function(){
    //KRETANJE PLAYER
    this.player.body.velocity.x=0; //ovo smo stavili na nulu tako da kad nista ne stisnemo da avion stane
    this.player.body.velocity.y=0;


    if(this.cursors.left.isDown){  //definiranje lijevo, desno
      this.player.body.velocity.x= -this.player.speed;
    }else if(this.cursors.right.isDown){
      this.player.body.velocity.x= this.player.speed;
    }

    if(this.cursors.up.isDown){  //definrianje gore dolje
      this.player.body.velocity.y= -this.player.speed;
    }else if(this.cursors.down.isDown){
      this.player.body.velocity.y= this.player.speed;
    }


    //ISPALJIVANJE ROCKETS
    if(this.input.keyboard.isDown(Phaser.Keyboard.Q)){ //postavljamo funkciju da pucamo sa Q 
      this.fire_rocket();
    }

    //ISPALJIVANJE BULLETS
    if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || this.input.activePointer.isDown){ //postavljamo funkciju da pucamo sa SPACEOM ili klikom misa
      //KRAJ IGRE MAIN MENU KOMANDA ISTA KAO ZA PUCANJE BULLETA
      if(this.returnText && this.returnText.exists){
        this.quitGame();
      }else{
        this.fire_bullet();
      }      
    }

  },

   Delay : function(){
    //PORUKA SA KOMANADAMA
    if(this.instructions.exists && this.time.now > this.instExpire){
      this.instructions.destroy();
    }
    //ANIMACIJE GOST/FLY PODESABANJA ZA TRIGGER
    if(this.ghostUntil && this.ghostUntil < this.time.now){
      this.ghostUntil=null;
      this.player.play('fly');
    }
    //VRACANJE NA MAIN MENU NAKON STO JE IGRA GOTOVA
    if(this.showReturn && this.time.now > this.showReturn){
      this.returnText=this.add.text(
        this.game.width/2,this.game.height/2+20,
        'Press SPACEBAR or tap game to go back to Main Menu',
        {font:'16px sans-serif',fill:'#283D2D'}
      );
      this.returnText.anchor.setTo(0.5,0.5);
      this.showReturn=false;
    }

    //BOSS KADA DODJE NA POZICIJU POCINJE SE MICATI LIJEVO DESNO I DOBIVA HEALTH
    if(this.bossApproaching&&this.boss.y>80){
      this.bossApproaching=false;
      this.boss.nextShotAt=0;

      this.boss.body.velocity.y=0;
      this.boss.body.velocity.x=BasicGame.BOSS_X_VELOCITY;

      //dopustanje da ide izvan granica worlda
      this.boss.body.bounce.x=1;
      this.boss.body.collideWorldBounds=true;
    }

  },


  quitGame: function (pointer) {
    this.desert.destroy();
    this.player.destroy();
    this.enemyPool.destroy();
    this.rocketPool.destroy();
    this.bulletPool.destroy();
    this.explosionPool.destroy();
    this.instructions.destroy();
    this.scoreText.destroy();
    this.endText.destroy();
    this.returnText.destroy();
    this.shooterPool.destroy();
    this.enemyBulletPool.destroy();
    this.powerUpPoll.destroy();
    this.bossPool.destroy();
    //  Onda idemo nazad na main menu
    this.state.start('MainMenu');

  },


   //-------COLLISION OF OBJECT-------------------------------------------------------------------------------------------

  enemyHit_rocket : function (rocket,enemy){ // callback function for overlap()
    rocket.kill();//phaser function to kill sprites
    this.damageEnemy(enemy,BasicGame.ROCKET_DAMAGE); 
  },

  enemyHit_bullet : function (bullet,enemy){ 
    bullet.kill();   
    this.damageEnemy(enemy,BasicGame.BULLET_DAMAGE); 
  },

  playerHit : function(player,enemy,playerFlySFX){
    //provjeri da li je gost not until definiran ili null
    if(this.ghostUntil && this.ghostUntil > this.time.now){
      return;
    } 

    //zabijanje u enemy 5 damage
    this.damageEnemy(enemy,BasicGame.CRASH_DAMAGE);
    var life=this.lives.getFirstAlive();
    if(life !==null){
      this.shieldHitSFX.play();
      life.kill();
      this.rocketLevel=0;//namjestam da kad izgubimo zivot da nam se broj raketa vraca na nulu
      this.ghostUntil = this.time.now + BasicGame.PLAYER_GHOST_TIME;
      this.player.play('ghost');
    }else{
      this.playerBoss_explosionSFX.play();      
      this.explode(player);
      player.kill(); 
      this.bossFlySFX.destroy();
      this.playerFlySFX.destroy();
      this.enemyPool.destroy();
      this.shooterPool.destroy();
      this.bossPool.destroy();
      this.enemyBulletPool.destroy();     
      this.displayEnd(false);
    }
  },


  //-----------FIRE WEAPONS------------------------------------------------------------------------------------------------------------------

  fire_rocket:function(){ //radim funkciju koje ce pucati ispod playera i vracati rocket u poll
   
    if(!this.player.alive || this.nextShotAt > this.time.now){
      return;
    }

    this.nextShotAt = this.time.now + this.shotDelayRocket;
    this.rocketLaunchSFX.play();

    var rocket;
    if(this.rocketLevel===0){
      if(this.rocketPool.countDead()===0){
        return;
      }
      rocket=this.rocketPool.getFirstExists(false); 
      rocket.reset(this.player.x,this.player.y-20);
      rocket.body.velocity.y=-BasicGame.ROCKET_VELOCITY;
    }else{
      if(this.rocketPool.countDead()<this.rocketLevel*2){
        return;
      }
      for(var i=0; i < this.rocketLevel; i++){        
        rocket=this.rocketPool.getFirstExists(false);
        //dodaj rocket lijevi       
        rocket.reset(this.player.x,this.player.y-20);
        //lijeve rakete se sire pod kutem od -95 do -135
        this.physics.arcade.velocityFromAngle(
          -95-i*10,BasicGame.ROCKET_VELOCITY,rocket.body.velocity
        );       

        rocket=this.rocketPool.getFirstExists(false);
        //dodaj rocket desni     
        rocket.reset(this.player.x,this.player.y-20);
        //desno rakete se sire pod kutem od -95 do -135
        this.physics.arcade.velocityFromAngle(
          -85+i*10,BasicGame.ROCKET_VELOCITY,rocket.body.velocity
        );        
      }
    }  
  
  },

  fire_bullet:function(){ //radim funkciju koje ce pucati sastrane playera, i vratcaati bullete u poll
    if(!this.player.alive || this.nextShotAt > this.time.now){
      return;
    }

    if(this.bulletPool.countDead()===0){// ako bullet ne pogodi metu vrati ga u pool
      return;
    }

    this.nextShotAt = this.time.now + this.shotDelayBullet;
    this.bulletFireSFX.play();

    //BULLET 1
    //nadji prvi metak u poolu
    var bullet1=this.bulletPool.getFirstExists(false);    

    //resetiraj sprajt i stavi ga na novu lokaciju
    bullet1.reset(this.player.x-10,this.player.y-40); 

    //brzina bulleta
    bullet1.body.velocity.y=-BasicGame.BULLET_VELOCITY;

  
    //BULLET 2
    //nadji prvi metak u poolu
    var bullet2=this.bulletPool.getFirstExists(false);

    //resetiraj sprajt i stavi ga na novu lokaciju
    bullet2.reset(this.player.x+10,this.player.y-40);

    //brzina bulleta
    bullet2.body.velocity.y=-500;  
  },

  //------------EXPLOSION--------------------------------------------------------------------------------------------------------

  explode : function(sprite){
    if(this.explosionPool.countDead()===0){
      return;
    }
    var explosion=this.explosionPool.getFirstExists(false);
    explosion.reset(sprite.x,sprite.y);
    explosion.play('boom',15,false,true);
    // dodajemo brzinu spritea brzini explozije
    explosion.body.velocity.x=sprite.body.velocity.x;
    explosion.body.velocity.y=sprite.body.velocity.y;
  },

  //DAMAGE------------------------------------

  damageEnemy : function(enemy,damage){
    enemy.damage(damage);//automatski ubija ako je health nula
    if(enemy.alive){
      enemy.play('hit');
      this.shieldHitSFX.play();
    }else{
      this.explode(enemy);
      this.explosionSFX.play();
      this.spawnPowerUp(enemy);
      this.addToScore(enemy.reward);

      //provjeravam dali je sprite boss
      //ako je ako ga ubijem,unisti sve poolove, i prikazi kraj igre
      if(enemy.key==='boss'){        
        this.bossFlySFX.destroy();
        this.playerBoss_explosionSFX.play();
        this.successSFX.play();
        this.playerFlySFX.destroy();
        this.enemyPool.destroy();
        this.shooterPool.destroy();
        this.bossPool.destroy();
        this.enemyBulletPool.destroy();
        this.displayEnd(true);
      }
    }
  },

  //SCORE-------------------------------------
  addToScore : function(score){
    this.score += score;
    this.scoreText.text=this.score;    

    //ovim se osiguravamo da se boss nakon sto ga ubijemo nece vise generirati na ekran
    if(this.score>=2000 && this.bossPool.countDead()==1){//ako imamo 20000 ili stavi borbu s bossom
      this.spawnBoss();
    }
  },

  displayEnd : function(win){
    if(this.endText && this.endText.exists){
      return;
    }

    var msg=win?'You Win!!!' : 'Game Over';    

    this.endText = this.add.text(
      this.game.width/2, this.game.height/2 - 60,msg,
      {font:'72px serif', fill:'#283D2D'}
    );
    this.endText.anchor.setTo(0.5,0);
    this.showReturn = this.time.now + BasicGame.RETURN_MESSAGE_DELAY;
  },

  spawnPowerUp : function(enemy){
    if(this.powerUpPoll.countDead()===0 || this.rocketLevel===2){//rocket lavel moze biti trodupli znaci 4 rakete
      return;
    }

    if(this.rnd.frac() < enemy.dropRate){
      var powerUp=this.powerUpPoll.getFirstExists(false);
      powerUp.reset(enemy.x,enemy.y);
      powerUp.body.velocity.y=BasicGame.POWERUP_VELOCITY;
    }
  },

  playerPowerUp : function(player,powerUp){
    this.addToScore(powerUp.reward);
    powerUp.kill();
    this.powerUpSFX.play();    
    if(this.rocketLevel<2){
      this.rocketLevel++;
      // console.log(this.rocketLevel);    
    }
  },

  spawnBoss : function(){
    this.bossApproaching=true;// boss je neranjiv dok ne zauzme svoju poziciju
    this.boss.reset(this.game.width/2,0,BasicGame.BOSS_HEALTH);
    this.physics.enable(this.boss,Phaser.Physics.ARCADE);
    this.boss.body.velocity.y = BasicGame.BOSS_Y_VELOCITY;
    this.boss.play('fly');
  },

};//END BASIC GAME PROTOTYPE
