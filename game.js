window.onload = function() {
    var tileSize = 70;
    var numRows = 4;
    var numCols = 5;
    var tileSpacing = 10;
    var tilesArray = [];
    var selectedArray = [];
    var playSound;
    var score;
    var timeLeft;
    var tilesLeft;
    var game = new Phaser.Game(400,400);

    var playGame = function(game) {};
    var titleScreen = function(game) {};
    var gameOver = function(game) {};

    playGame.prototype = {
        scoreText: null,
        timeText: null,
        soundArray: [],
        
        decreaseTime: function() {
            timeLeft--;
            this.timeText.text = "Time left: " + timeLeft;
            if (timeLeft==0) {
                game.state.start("GameOver");
            }
        },

        preload: function() {
            game.load.spritesheet("tiles", "images/tiles.png", tileSize, tileSize);
            game.load.audio("select", ["sounds/click.mp3", "sounds/click.ogg"]);
            game.load.audio("right", ["sounds/right.wav", "sounds/right.ogg"]);
            game.load.audio("wrong", ["sounds/wrong.mp3", "sounds/wrong.ogg"]);
        },

        create: function() {
            score = 0;
            timeLeft = 60;
            this.placeTiles();
            
            if (playSound) {
                this.soundArray[0] = game.add.audio("select", 1);
                this.soundArray[1] = game.add.audio("right", 1);
                this.soundArray[2] = game.add.audio("wrong", 1);
            }

            game.stage.disableVisibilityChange = true;

            var style = {
                font: "22px Consolas",
                fill: "Pink",
                align: "center"
            }

            this.scoreText = game.add.text(5, 5, "Score: " + score, style);
            this.timeText = game.add.text(game.width-5, 5, "Time left: " + timeLeft, style);
            this.timeText.anchor.set(1, 0);
            game.time.events.loop(Phaser.Timer.SECOND, this.decreaseTime, this);
        },

        placeTiles: function() {
            tilesLeft = numRows*numCols;
            var leftSpace = (game.width-(numCols*tileSize)-((numCols-1)*tileSpacing))/2;
            var topSpace = (game.height-(numRows*tileSize)-((numRows-1)*tileSpacing))/2;
            
            for (let i=0; i<numRows*numCols; i++) {
                tilesArray.push(Math.floor(i/2));
            }

            for (i=0; i<numRows*numCols; i++) {
                var from = game.rnd.between(0, tilesArray.length-1);
                var to = game.rnd.between(0, tilesArray.length-1);
                var temp = tilesArray[from];
                tilesArray[from] = tilesArray[to];
                tilesArray[to] = temp;
            }

            for (let i=0; i<numCols; i++) {
                for (let j=0; j<numRows; j++) {
                    var tile = game.add.button(leftSpace+i*(tileSize+tileSpacing), topSpace+j*(tileSize+tileSpacing), "tiles", this.showTile, this);
                    tile.frame = 10;
                    tile.value = tilesArray[j*numCols+i];
                }
            }
        },

        showTile: function(target) {
            if (selectedArray.length<2 && selectedArray.indexOf(target)==-1) {
                if (playSound) {
                    this.soundArray[0].play();
                }
                target.frame = target.value;
                selectedArray.push(target);
                if (selectedArray.length == 2) {
                    game.time.events.add(Phaser.Timer.SECOND, this.checkTiles, this);
                }
            }
        },

        checkTiles: function() {
            if (selectedArray[0].value==selectedArray[1].value) {
                if (playSound) {
                    this.soundArray[1].play();
                }
                score++;
                timeLeft += 2;
                this.timeText.text = "Time left: " + timeLeft;
                this.scoreText.text = "Score: " + score;
                selectedArray[0].destroy();
                selectedArray[1].destroy();
                tilesLeft -= 2;
                if (tilesLeft==0) {
                    tilesArray.length = 0;
                    selectedArray.length = 0;
                    this.placeTiles();
                }
            } else {
                if (playSound) {
                    this.soundArray[2].play();
                }
                selectedArray[0].frame = 10;
                selectedArray[1].frame = 10;
            }
            selectedArray.length = 0;
        }
    }

    titleScreen.prototype = {
        preload: function() {
            game.load.spritesheet("soundicons", "images/soundicons.png", 46, 50);
        },

        create: function() {
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            var style = {
                font: "48px Consolas",
                fill: "pink",
                align: "center"
            };
            var text = game.add.text(game.width/2, game.height/2 - 100, "Let's go!", style);
            text.anchor.set(0.5);
            var soundButton = game.add.button(game.width/2-100, game.height/2+100, "soundicons", this.startGame, this);
            soundButton.frame = 1;
            soundButton.anchor.set(0.5);
            soundButton.scale.setTo(1.5,1.5);
            soundButton = game.add.button(game.width/2+100, game.height/2+100, "soundicons", this.startGame, this);
            soundButton.frame = 0;
            soundButton.anchor.set(0.5);
            soundButton.scale.setTo(1.5,1.5);
        },

        startGame: function(target) {
            if (target.frame == 1) {
                playSound = true;
            } else {
                playSound = false;
            }
            game.state.start("PlayGame");
        }
    }

    gameOver.prototype = {
        create: function() {
            var style = {
                font: "22px Consolas",
                fill: "Yellow",
                align: "center"
            };
            var text = game.add.text(game.width/2, game.height/2, "Game Over!\n\nYour score: "+score+"\n\nTap to restart", style);
            text.anchor.set(0.5);
            game.input.onDown.add(this.restartGame, this);
        },

        restartGame: function() {
            tilesArray.length = 0;
            selectedArray.length = 0;
            game.state.start("TitleScreen");
        }
    }

    game.state.add("PlayGame", playGame);
    game.state.add("TitleScreen", titleScreen);
    game.state.add("GameOver", gameOver);
    game.state.start("TitleScreen");
}