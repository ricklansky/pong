(function() {
    var _ = new Constants(),
        ballIsInPlay = false,
        game = new Phaser.Game(_.width, _.height, Phaser.AUTO, '', { preload: preload, create: create, update: update }),
        currentSpeed,
        walls,
        leftPlayer,
        rightPlayer,
        ball,
        sounds = {},
        scores = {left: 0, right: 0};

    function preload() {
    	game.load.image('bg', 'assets/bg.png');
        game.load.image('paddle', 'assets/paddle.png');
        game.load.image('ball', 'assets/ball.png');

        game.load.audio('fail', ['assets/fail.mp3', 'assets/fail.ogg'], true);
        game.load.audio('wall', ['assets/wall.mp3', 'assets/wall.ogg'], true);
        game.load.audio('paddleSound', ['assets/paddle.mp3', 'assets/paddle.ogg'], true);
    }

    function create() {
        var sprite = game.add.sprite(0, 0, 'bg');
        sprite.scale.setTo(_.width / _.background.width, _.height / _.background.height);

        leftPlayer = createPlayer(_.paddle.offset, _.height/2.0);
        rightPlayer = createPlayer(_.width - _.paddle.offset - _.paddle.width, _.height/2.0);

        walls = game.add.group();
        createWall(1);
        createWall(_.height - 1);

        createScores();

        sounds.fail = game.add.audio('fail');
        sounds.wall = game.add.audio('wall');
        sounds.paddle = game.add.audio('paddleSound');

        ball = createBall();
    }

    function update() {
    	game.physics.collide(ball, leftPlayer, ballHit, null, this);
        game.physics.collide(ball, rightPlayer, ballHit, null, this);
        game.physics.collide(ball, walls, ballHit, null, this);

        checkForMovement(leftPlayer, Phaser.Keyboard.A, Phaser.Keyboard.Z);
        checkForMovement(rightPlayer, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN);

        checkForScore();
    }

    function createPlayer(x, y) {
        var player = game.add.sprite(x, y, 'paddle');

        setPieceParameters(player, 0, true);

        return player;
    }

    function createBall() {
        var ball = game.add.sprite(_.width/2.0, _.height/2.0, 'ball');

        setPieceParameters(ball, 0.5, false);
        ball.body.collideCallback = ballHit;

        releaseBall();
        return ball;
    }

    function setPieceParameters(piece, xAnchor, immovable) {
        piece.anchor.setTo(xAnchor, 0.5);
        piece.body.collideWorldBounds = true;
        piece.body.bounce.setTo(1, 1);
        piece.body.immovable = immovable;
    }

    function createWall(wallLocation) {
        var wall = walls.create(_.width/2.0, wallLocation);
        wall.anchor.setTo(0.5, 0.5);
        wall.renderable = false;
        wall.height = 1;
        wall.width = _.width;
        wall.body.immovable = true;
    }

    function createScores() {
        scores.leftText = game.add.text(_.score.offset.x, _.score.offset.y, '0', _.score.font);
        scores.rightText = game.add.text(_.score.offset.rightNumber, _.score.offset.y, '0', _.score.font);
    }

    function releaseBall() {
        setTimeout(function() {
            ballIsInPlay = true;
            currentSpeed = _.ball.speed;

            var vectorSpeed = Math.sqrt(currentSpeed*currentSpeed/2.0);
            ball.body.velocity.x = vectorSpeed * (Math.random() > 0.5 ? 1.0 : -1.0);
            ball.body.velocity.y = vectorSpeed * (Math.random() > 0.5 ? 1.0 : -1.0);
        }, 3000);
    }

    function checkForMovement(player, upKey, downKey) {
        var upPressed = game.input.keyboard.isDown(upKey),
            downPressed = game.input.keyboard.isDown(downKey);

        if (upPressed && !downPressed) {
            player.body.velocity.y = -_.paddle.speed;
        } else if (downPressed && !upPressed) {
            player.body.velocity.y = _.paddle.speed;
        } else {
            player.body.velocity.y = 0;
        }
    }

    function checkForScore() {
        // Account for the fact that it takes an iteration for direction changes to occur
        var changingDirection = ball.body.velocity.x * ball.body.deltaX() < 0.0;
        if (changingDirection) {
            ball.body.x = ball.body.preX;
        }

        if(ballIsInPlay && (ball.topLeft.x < _.paddle.leftEdge || ball.topRight.x > _.paddle.rightEdge)) {
            score();
        }
    }

    function score() {
        if (ball.body.x < _.width / 2) {
            scores.right += 1;
        } else {
            scores.left += 1;
        }

        sounds.fail.play();
        ballIsInPlay = false;
        ball.kill();

        if (updateScores()) {
            ball = createBall();
        }
    }

    function updateScores() {
        scores.leftText.setText(scores.left < _.score.winner ? scores.left : 'WINNER');
        if (scores.left === _.score.winner) {
            return false;
        }

        scores.rightText.setText(scores.right < _.score.winner ? scores.right : 'WINNER');
        if (scores.right === _.score.winner) {
            scores.rightText.x = _.score.offset.rightText;
            return false;
        }

        return true;
    }

    function ballHit(__argCount, ballBody, otherBody) {
        var sprite = otherBody.sprite;
        if (sprite === rightPlayer || sprite === leftPlayer) {
            playerHit(ballBody, sprite);
        } else {
            sounds.wall.play();
        }
    }

    function playerHit(ballBody, player) {
        currentSpeed *= _.ball.increase;
        var deltaY = (ballBody.sprite.worldCenterY - player.worldCenterY) / _.paddle.height,
            newYSpeed = currentSpeed * (1.7 * deltaY),
            newXDirection = ballBody.velocity.x > 0 ? -1.0 : 1.0;

        sounds.paddle.play();

        ballBody.velocity.y = newYSpeed;
        ballBody.velocity.x = newXDirection * Math.sqrt(currentSpeed * currentSpeed - newYSpeed * newYSpeed);
    }
})();