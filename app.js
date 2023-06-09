var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 300 },
        debug: false
    }
},
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

//load the assets
function preload ()
{
this.load.image('sky', 'assets/sky.png');
this.load.image('ground', 'assets/platform.png');
this.load.image('star', 'assets/star.png');
this.load.image('bomb', 'assets/bomb.png');
this.load.spritesheet('dude', 
    'assets/dude.png',
    { frameWidth: 32, frameHeight: 48 }
);
}


//create the game world
function create ()
{
//  A simple background for our game (if we put star first , star will cover Bg)
this.add.image(400, 300, 'sky');

platforms = this.physics.add.staticGroup();  //This means we're using the Arcade Physics system but we need to add it in config first (static:non moving)

platforms.create(400, 568, 'ground').setScale(2).refreshBody();            //creates a static platform object at coordinates (400, 568) with the key 'ground'. 
//The setScale(2) call scales the platform by a factor of 2, 
//and refreshBody() updates the physics body to reflect any changes in scale or position (is required because we have scaled a static physics body, so we have to tell the physics world about the changes we made).

//  Now let's create some ledges
platforms.create(600, 400, 'ground');
platforms.create(50, 250, 'ground');
platforms.create(750, 220, 'ground');

// The player and its settings
player = this.physics.add.sprite(100, 450, 'dude');   //has dynamic physics body by default

//  Player physics properties. Give the little guy a slight bounce.
player.setBounce(0.2);                //slight bounce(jump)
player.setCollideWorldBounds(true);  //stop player from running outside ara 800*600

//  Our player animations, turning, walking left and walking right.
this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }), //left use frames 0,1,2,3
    frameRate: 10,   //runs 10 frame per second
    repeat: -1      //tells animation to loop
});

this.anims.create({
    key: 'turn',
    frames: [ { key: 'dude', frame: 4 } ],
    frameRate: 20
});

this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
});

//  Input Events
cursors = this.input.keyboard.createCursorKeys();

//  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
});

stars.children.iterate(function (child) {
    //  Give each star a slightly different bounce
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

});

bombs = this.physics.add.group();

//  The score
scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

//  Collide the player and the stars with the platforms
this.physics.add.collider(player, platforms);
this.physics.add.collider(stars, platforms);
this.physics.add.collider(bombs, platforms);

//  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function (collect stars)
this.physics.add.overlap(player, stars, collectStar, null, this);

//  Checks to see if the player overlaps with any of the bombs, if he does call the hitBomb function (hit bombs)
this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
if (gameOver)
{   
    //show game over message and score
    var gameOverTextStyle = { fontSize: '48px', fill: '#000', align: 'center' };
    var gameOverText = this.add.text(400, 250, 'Game Over', gameOverTextStyle);
    gameOverText.setOrigin(0.5);

    var scoreDisplayText = this.add.text(400, 320, 'Your Score: ' + score, { fontSize: '32px', fill: '#000', align: 'center' });
    scoreDisplayText.setOrigin(0.5);

    var restartText = this.add.text(440, 360, 'Press Space to Restart', { fontSize: '32px', fill: '#000', align: '',});
    restartText.setOrigin(0.6);



    if (cursors.space.isDown)
    {
        score = 0;
        gameOver = false;
        //restart the game
        this.scene.restart('Game');
    }
       
}



if (cursors.left.isDown)
{
    player.setVelocityX(-160);

    player.anims.play('left', true);
}
else if (cursors.right.isDown)
{
    player.setVelocityX(160);

    player.anims.play('right', true);
}
else
{
    player.setVelocityX(0);

    player.anims.play('turn');
}

if (cursors.up.isDown && player.body.touching.down)  //touching the floor and press down
{
    player.setVelocityY(-330); //vertical velocity 330 px/sec sq
}
}


function collectStar (player, star)
{
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)  //how many stars alive
{
    //  A new batch of stars to collect
    stars.children.iterate(function (child) {
         //re-enable all of the stars and reset their y position to zero.
         // This will make all of the stars drop from the top of the screen again.
        child.enableBody(true, child.x, 0, true, true);


    });

    
    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);


    var bomb = bombs.create(x, 16, 'bomb');  //create bomb
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;

}
}


function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}


