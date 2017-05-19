// IMAGE SECTION -------------------------------------------

// Load the player images. 
var playerImages = [];
for (i = 0; i < 4; i++) {
    playerImages[i] = new Image();
    playerImages[i].src = 
        "images/placeholder/player" + (i + 1) + ".gif";
}

// Load the background image. 
var backgroundImage = new Image();
backgroundImage.src = "Image/Background/Backgroundv1.png";

// The width of the backround image 
var backgroundImageWidth = 1800; 

// The height of the 
var backgroundImageHeight = 450; 

// Load the carrot enemy images. 
var enemyImages = []; 
for (i = 0; i < 2; i++) {
    enemyImages[i] = new Image();
    enemyImages[i].src = 
        "Image/Mon-Mini-Carrot300x300/Mon-Mini-Carrot300x300n" 
            + (i + 1) + ".png";
}

// Load the miniboss (potato) images. 
var minibossImages = []; 
for (i = 0; i < 4; i++) {
    minibossImages[i] = new Image();
    minibossImages[i].src = 
        "Image/Mon-Mid-Potato400x400/Mon-Mid-Potato400x400n" 
            + (i + 1) + ".png";
}

// Load the boss (pumpkin) images. 
var bossImages = []; 
for (i = 0; i < 2; i++) {
    bossImages[i] = new Image();
    bossImages[i].src 
        = "Image/Mon-Final-Pumpkin220x220/Mon-Final-Pumpkin220x220n" 
            + (i + 1) + ".png";
}

// Load the easter egg enemy images. 
var easterEggImages = []; 
for (i = 0; i < 5; i++) {
    easterEggImages[i] = new Image();
    easterEggImages[i].src = "Image/Mon-Mini-EasterEgg300x300/Mon-Mini-EasterEgg300x300n" + (i + 1) + ".png";
}

//Load the ester egg boss images. 
var easterBossImages = []; 
for (i = 0; i < 12; i++) {
    easterBossImages[i] = new Image();
    easterBossImages[i].src = "Image/Mon-Final-EasterEgg300x300/Mon-Mini-EasterEgg300x300n" + (i + 1) + ".png";
}

// DATABASE SECTION ----------------------------------------

//connect to firebase.
var database = firebase.database();

// Reference to question data. 
var refQuestions = database.ref('questions');

// All of the question data from the database. 
var questions; 

// All of the keys for the question data. 
var keysQuestions; 

// Grab all trivia question data. 
refQuestions.once('value').then(function(data) {
    questions = data.val();
    keysQuestions = Object.keys(questions);
});

// Placeholder variable for level data. 
var levelNumber = 1; 

// Reference to level data. 
var refLevel = database.ref("levels/level" + levelNumber);

// The entire data for the level. 
var level; 

// The entire data for this level's dialogue. 
var dialogue; 

// Whether the page has finished loading. 
var pageLoaded = false; 

// Whether the level data has been retrieved from the database. 
var dataLoaded = false; 

// Whether the game has started. 
var gameStarted = false; 

// Grab all data for this level, and then start the game. 
refLevel.once('value').then(function(data) {
    level = data.val();
    dialogue = level["dialogue"];
    dataLoaded = true; 
    attemptStart();
});

// Makes sure the page finishes loading before starting. 
$(window).on('load', function(){
    pageLoaded = true; 
    attemptStart();
}); 

// Attempts to start the game. 
// Runs only after necessary data is loaded. 
function attemptStart() {
    if (dataLoaded && pageLoaded && easterLoaded && !gameStarted) {
        gameStarted = true; 
        startGame();
    }
}


// EASTER EGG CODE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Whether the easter egg has been activated. 
var easterEgg = false; 

// Whether the easter egg data has been checked. 
var easterLoaded = false; 

// Checks for easter egg data. 
firebase.auth().onAuthStateChanged(function(user) {
    var user1 = firebase.auth().currentUser;
    if(user1) {
        firebase.database().ref('/users/' 
            + firebase.auth().currentUser.uid).once('value').then(
                function(snapshot) {
                    if (snapshot.val().easter == 1) {
                        easterEgg = true;
                        firebase.database().ref('users/' 
                            + firebase.auth().
                                currentUser.uid).update({ 
                            easter: "0" 
                        });
                    }
                    easterLoaded = true; 
                    attemptStart();
                });
    } else {
        easterLoaded = true; 
        attemptStart();
    }
});

// UI FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Switches between the combat buttons and the trivia buttons. 
// @param trivia true if trivia to be shown, false if combat is to be shown. 
function toggleButtons(trivia) {
    if (trivia) {
        $("#divCombatButtons").css("display", "none");
        $("#divAnswerButtons").css("display", "flex");
    } else {
        $("#divCombatButtons").css("display", "flex");
        $("#divAnswerButtons").css("display", "none");
    }                
}

// Hide the question box. 
function hideQuestion() {
    $("#divQuestion").css("display", "none");
}

// Show the question box. 
function showQuestion() {
    $("#divQuestion").css("display", "block");
}

// Hide the dialogue box. 
function hideDialogue() {
    $("#divDialogue").css("display", "none"); 
}

// Show the dialogue box. 
function showDialogue() {
    $("#divDialogue").css("display", "block"); 
}

// Hide the game over box. 
function hideGameOver() {
    $("#divGameOver").css("display", "none"); 
}

// Show the game over box. 
function showGameOver() {
    $("#divGameOver").css("display", "block"); 
}

// Hide the level complete box. 
function hideLevelComplete() {
    $("#divLevelComplete").css("display", "none"); 
}

// Show the level complete box. 
function showLevelComplete() {
    $("#divLevelComplete").css("display", "block"); 
}

// The value for freeze prior to freezing the game. 
var previousFreeze; 

// The value for blockInput prior to pausing the game. 
var previousBlockInput; 

// Opens the pause menu and pauses the game. 
// @param pause true if pausing, false if unpausing. 
function togglePause(pause) {
    if (pause) {
        previousFreeze = freeze; 
        previousBlockInput = blockInput; 
        freeze = pause; 
        blockInput = pause; 
        $("#divPauseScreen").css("display", "block");
    } else {
        freeze = previousFreeze; 
        blockInput = previousBlockInput; 
        $("#divPauseScreen").css("display", "none");
    } 
}

// Resize the game area when the window changes size. 
window.addEventListener("resize", function() {
    setScreenSize(); 
    gameArea.canvas.width = getGameWidth(); 
    gameArea.canvas.height = getGameHeight(); 
    refresh();
});


// GAME FLOW FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Called when the level is successfully completed. 
// This function is currently a placeholder. 
function levelComplete() {
    blockInput = true; 
    freeze = true; 
    showLevelComplete();
}

// Called when the player fails the level. 
// This function is currently a placeholder. 
function gameOver() {
    blockInput = true; 
    freeze = true; 
    easterEgg = false; 
    showGameOver();
}

// COMBAT FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Freezes the level. 
var freeze = true; 

// Prevents the player from clicking certain buttons. 
// This doesn't freeze the entire level. 
var blockInput = true; 

// All of the enemy data for the current combat phase. 
var enemyData;

// The current combat phase. 
var combatPhase; 

// The current number of enemies spawned this phase. 
var spawnedCount; 

// The number of bosses remaining in this level. 
var remainingBosses;

// The background image's component. 
var background;

// The player character's component. 
var playerChar;

// The array of enemy components. 
var enemies = []; 

// The boss character's component. 
var bossChar; 

// The array of items. 
var items = []; 

// The player's max hp. 
var playerMaxHP = 10; 

// Each enemy's initial horizontal velocity. 
var enemySpeedX = -0.002; 

// The width of the game canvas. 
var gameWidth;  

// The height of the game canvas. 
var gameHeight; 

// Returns the gameWidth. 
// @param gameWidth The height of the game canvas. 
function getGameWidth() {
    return gameWidth; 
}

// Returns the gameHeight. 
// @param gameHeight The height of the game canvas. 
function getGameHeight() {
    return gameHeight; 
}

// Sets the screen size. 
function setScreenSize() {
    gameWidth = $(window).width(); 
    gameHeight = $(window).height() * 0.67;
}

// Initial setting. 
setScreenSize();

// Loads the data for the next combat phase. 
function loadEnemyData() {
    combatPhase++;
    if (combatPhase <= Object.keys(level["combat"]).length) {
        spawnedCount = 1; 
        enemyData = level["combat"]["combat" + combatPhase];
    }
}

// Restarts the level. 
function restartLevel() {
    // Unpause 
    togglePause(false);
    
    // Block input. 
    freeze = true; 
    blockInput = true; 
    
    // Clear skill timer and question timer. 
    if (skillTimer != null)
        clearInterval(skillTimer);
    if (questionTimer != null)
        clearTimeout(questionTimer);
    
    // Clear all enemy auto attack. 
    enemies.forEach(function(part, index, arr){
        if (arr[index].autoAttackLoop != null) {
            clearInterval(arr[index].autoAttackLoop);
        }
    });
    
    // Reset the UI. 
    hideDialogue();
    hideQuestion();
    toggleButtons(false);
    hideGameOver();
    
    // Reset the placeholder button text. 
    $("#divCombatButton2").html(
            "Skill<br>Does 3 damage to range.");
    $("#divCombatButton3").html("");
    $("#divCombatButton4").html("");
    $("#divCombatButton5").html("");
    
    // Reset the game area. 
    gameArea.stop();
    gameArea.clear();
    
    // Start the game. 
    startGame();
}

// The y distance between the bottom of the game area and the bottom of each character. 
var yFromBottom = 0.15; 

// Starts the level. 
function startGame() {
    
    previousFreeze = false; 
    previousBlockInput = false; 
    
    remainingBosses = level.bosses;
    combatPhase = 0; 
    bossChar = null; 
    enemies = []; 
    usedQuestions = []; 
    items = []; 
    skillOnCooldown = false; 
    
    // Set up the player and background components. 
    playerChar = new component(0.25, 0, playerImages, 5, 
                               0.05, 1.0 - yFromBottom - 0.25, "combat", 0, playerMaxHP);
    background = new component(1.0, 1.0, backgroundImage, null, 
                               0, 0, "background");
    background.speedX = -0.002;
    
    // Un-freeze the UI. 
    freeze = false; 
    blockInput = false; 
    
    // Start the combat phase. 
    startCombat();
    
    // Start the canvas. 
    gameArea.start();    
}

// Starts the combat phase.  
function startCombat() {
    // Set the number of enemies. 
    loadEnemyData();
    // Spawn one enemy. 
    spawnEnemy();
}

// The area where the game characters are drawn. 
var gameArea = {
    canvas : $("#divLevelArea").children("canvas")[0],
    // Called to set up the canvas. 
    start : function() {
        this.canvas = $("#divLevelArea").children("canvas")[0];
        this.canvas.width = gameWidth; 
        this.canvas.height = gameHeight; 
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;
        // Update the game area every 10 milliseconds. 
        this.interval = setInterval(updateGameArea, 10);
    },
    // Clears the canvas. 
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    // Stops the canvas entirely. 
    stop : function() {
        clearInterval(this.interval);
    }
}

// Each component represents a character or sprite in the canvas. 
// @param width The width of the component. 
// @param height The height of the component. 
// @param img The image or image array for the component. 
// @param x The initial x position of the component. 
// @param y The initial y position of the component. 
// @param type The type of the component as a string. 
// @param speedX The initial horizontal velocity of the component. 
// @param initialHP The initial hp of the component. 
function component(width, height, img, imgRate, 
                    x, y, type, speedX, initialHP) {
    // The initial hp. Set it to 1 if a value is not provided. 
    this.hp = (initialHP == null) ? 1 : initialHP; 
    // Set the component's type. 
    this.type = type;
    
    // The currently displayed image. 
    this.image; 
    // The image array for if the image is animated. 
    this.imageArray = null; 
    // The current index in the array. 
    this.imageCount = 0; 
    // Update the animation after this number of frames. 
    this.updatesPerAnim = imgRate; 
    // The number of updates since the last animation frame. 
    this.updateCount = 0; 
    // Set the image or image array. 
    if (img.constructor === Array) {
        this.imageArray = img; 
        this.image = this.imageArray[this.imageCount]; 
    } else {
        this.image = img; 
    }
    
    // Set the width and height. 
    this.width = width;
    this.height = (height == 0) ? (this.width) : (height);
    
    // Returns the scaled width. 
    this.getWidth = function() {
        if (type != "background") {
            return this.width * getGameHeight(); 
        } else {
            return getGameHeight() / backgroundImageHeight * backgroundImageWidth; 
        }
    }
    // Returns the scaled height. 
    this.getHeight = function() {
        if (type != "background") {
            return this.height * getGameHeight(); 
        } else {
            return getGameHeight(); 
        }
    }
    
    // Set the initial position. 
    this.x = x;
    this.y = y;    
    
    // Returns the scaled x position. 
    this.getX = function() {
        return this.x * getGameWidth(); 
    }
    // Returns the scaled y position. 
    this.getY = function() {
        return this.y * getGameHeight(); 
    }
    
    // speedX is the horizontal velocity. 
    // If a speedX is not provided, set it to 0. 
    this.speedX = (speedX == null) ? 0 : speedX; 
    // speedY is the vertical velocity. 
    this.speedY = 0;
    
    // Called to refresh the component. 
    this.update = function() {
        // If the component is a background, make it restart. 
        if (this.type == "background") {
            if (this.getX() <= -this.getWidth()) {
                this.x = 0;
            }
        }
        ctx = gameArea.context;
        // Draw the image. 
        ctx.drawImage(this.image, 
            this.getX(), 
            this.getY(),
            this.getWidth(), 
            this.getHeight()); 
        // If it's a combat character, draw an hp marker. 
        if (this.type == "combat") {
            for (var i = 0; i < this.hp; i++){
                ctx.font="20px Georgia";
                ctx.fillStyle = "#f14040";
                ctx.fillText('♥',this.getX() + i*12, this.getY() - 10);
            }
        }
        if (this.type == "background") {
            // If it's a background, draw the image again. 
            ctx.drawImage(this.image, 
                this.getX() + getGameHeight() / backgroundImageHeight * backgroundImageWidth, 
                this.getY(),
                this.getWidth(), 
                this.getHeight());
        }
    }
    // Cycles through the animation. 
    this.animate = function() {
        // Ignore if the image isn't animated. 
        if (this.imageArray == null) 
            return; 
        // Only update once per number of updates. 
        this.updateCount++; 
        if (this.updateCount < this.updatesPerAnim) 
            return; 
        // Reset the update count. 
        this.updateCount = 0; 
        // Update the image. 
        this.imageCount++; 
        if (this.imageCount >= this.imageArray.length)
            this.imageCount = 0; 
        this.image = this.imageArray[this.imageCount];
    }
    // Called to re-calculate the component's position. 
        this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
     }
    // Returns whether this component has collided with another component. 
    // @param obj A component. 
    // @return true if the components collided, else false. 
    this.collided = function(obj) {
        // Return false if the component is null. 
        if (obj == null) {
            return false; 
        }
        // Returns whether the other component's left has passed this
        // component's right. 
        var myRight = this.getX() + this.getWidth(); 
        var otherLeft = obj.getX(); 
        return myRight > otherLeft;
    }
    // Stores this enemy's auto attack loop. 
    this.autoAttackLoop; 
}

// The interval between each auto attack, measured in milliseconds. 
var autoAttackInterval = 800; 

// The damage dealt during an auto attack. 
var autoAttackDamage = 1; 

// Repeatedly called as part of the auto attack mechanic. 
// Each auto attack deals damage to both the player and the enemy. 
// @param enemy The enemy to attack. 
function autoAttackUpdate(enemy) {
    if (freeze) 
        return; 
    hurtEnemy(enemy, autoAttackDamage); 
    hurtPlayer(autoAttackDamage);
}

// The x position at which a boss or miniboss stops moving. 
var bossStop = 0.55; 

// Updates the level. 
function updateGameArea() {
    if (freeze) 
        return;     
    // Determine the new background and player positions. 
    background.newPos();            
    playerChar.newPos();  
    // For each enemy... 
    enemies.forEach(function(part, index, arr){
        // Determine the new position. 
        arr[index].newPos();
        // If the enemy collides with the player... 
        if (playerChar.collided(arr[index])) {
            // and it's the first time... 
            if (arr[index].autoAttackLoop == null) {
                // Make the enemy stop moving. 
                arr[index].speedX = 0; 
                // Start the autoattack loop. 
                autoAttackUpdate(arr[index]);
                arr[index].autoAttackLoop = setInterval(function(){
                    autoAttackUpdate(arr[index]);
                }, autoAttackInterval); 
            }
        }
    });
    // Remove defeated enemies from the level. 
    killEnemies();
    // If there's a boss in the level...
    if (bossChar != null) {
        bossChar.newPos();
        // And it reaches the stop point...
        if (bossChar.getX() <= bossStop * getGameWidth()) {
            // Start the trivia gameplay. 
            startTrivia();
            freeze = true; 
        }
    }    
    animate();
    refresh();
}

// Deletes enemies by removing them from the array. 
function killEnemies() {
    enemies.forEach(function(part, index, arr){
        // If the enemy's health is fully depleted. 
        if (arr[index].hp <= 0) {
            // Stop auto attacking if the enemy `already is. 
            if (arr[index].autoAttackLoop != null) {
                clearInterval(arr[index].autoAttackLoop); 
            }
            // Remove the enemy from the array. 
            arr.splice(index, 1); 
            // Spawn a new enemy. 
            spawnEnemy();
            // Repeat the previous code. This helps when the 
            // changing index values makes the foreach loop skip 
            // an enemy. 
            while(arr[index] != null && arr[index].hp <= 0) {
                if (arr[index].autoAttackLoop != null) {
                    clearInterval(arr[index].autoAttackLoop); 
                }
                arr.splice(index, 1); 
                spawnEnemy();
            }
        }
    });
}

// Refreshes the level canvas. 
function refresh() {
    // Clear the canvas and draw the background. 
    gameArea.clear();
    background.update();
    
    // Draw the player character. 
    playerChar.update();    
    // Draw the enemy characters. 
    enemies.forEach(function(part, index, arr){
        arr[index].update();        
    });    
    // Draw the boss character if one exists. 
    if (bossChar != null) {
        bossChar.update();
    }
}

// Progresses the animations. 
function animate() {    
    playerChar.animate();
    enemies.forEach(function(part, index, arr){
        arr[index].animate();
    });
    if (bossChar != null) 
        bossChar.animate();
}

// Spawns an enemy, miniboss, or boss. 
function spawnEnemy() {
    
    // Update the dialogue box. 
    hideDialogue();
    checkDialogue();
    
    // If there are still enemies left in this combat phase. 
    if (spawnedCount <= Object.keys(enemyData).length) {
        // Spawn a regular enemy. 
        if (easterEgg) {
            enemies.push(new component(0.25, 0, easterEggImages, 5, 
                            1.0, 1.0 - yFromBottom - 0.22, 
                            "combat", enemySpeedX, 
                            enemyData["enemyhp" + spawnedCount]));
        } else {
            enemies.push(new component(0.25, 0, enemyImages, 35, 
                            1.0, 1.0 - yFromBottom - 0.25, 
                            "combat", enemySpeedX, 
                            enemyData["enemyhp" + spawnedCount]));
        }
        spawnedCount ++; 
        // Otherwise, if a boss hasn't been spawned yet... 
    } else if (bossChar == null) {
        // IF this is the last boss in the level...
        if (remainingBosses == 1) {
            // Spawn the last boss in this level. 
            if (easterEgg) {
                bossChar = new component(0.3, 0, easterBossImages, 5, 
                                     1.0, 1.0 - yFromBottom - 0.27, 
                                     "boss", enemySpeedX); 
            } else {
                bossChar = new component(0.4, 0, bossImages, 25, 
                                     1.0, 1.0 - yFromBottom - 0.4, 
                                     "boss", enemySpeedX); 
            }
        } else {
            // Otherwise, spawn a miniboss. 
            if (easterEgg) {
                bossChar = new component(0.3, 0, easterBossImages, 5, 
                                     1.0, 1.0 - yFromBottom - 0.27, 
                                     "boss", enemySpeedX); 
            } else {
                bossChar = new component(0.4, 0, minibossImages, 45, 
                                     1.0, 1.0 - yFromBottom - 0.4, 
                                     "boss", enemySpeedX); 
            }
        }        
        remainingBosses--; 
    }
}

// Deals damage to a specific enemy. 
// @param target The enemy. 
// @param damage The damage to be dealt. 
function hurtEnemy(target, damage) {
    target.hp -= damage; 
}

// Deals damage to the player. 
// @param damage The damage to be dealt. 
function hurtPlayer(damage) {
    playerChar.hp -= damage; 
    refresh();
    if (playerChar.hp <= 0) {
        gameOver();
    }
}

// The range of the user's eat attack, specifically, the maximum 
// distance between the player's right side and the enemy's 
// left side. 
var eatRange = 0.18;  

// The amount of damage done by the eat attack. 
var eatDamage = 1; 

// Use the eat attack, which deals damage to the closest enemy 
// within a short range. 
// This is called when the user clicks the eat button. 
function clickEat() {
    if (blockInput) 
        return;    
    // Calculate the range of the attack. 
    var farEnd = eatRange * getGameWidth() + playerChar.getX() + playerChar.getWidth();
    // Determine the closest enemy within range 
    var target = null;
    enemies.forEach(function(part, index, arr){
        if (arr[index].getX() < farEnd) {
            if (target == null) {
                target = arr[index];
            } else if(arr[index].getX() < target.getX()) {
                target = arr[index];
            }
        }
    });    
    // If a target is found, deal damage. 
    if (target != null) {
        hurtEnemy(target, eatDamage);
    }
}

// The range of the user's skill attack, specifically, the maximum 
// distance between the player's right side and the enemy's 
// left side. 
var skillRange = 0.8; 

// The amount of damage done by the skill attack. 
var skillDamage = 3; 

// This is true if the skill attack is currently on cooldown. 
var skillOnCooldown = false; 

// The skill's cooldown interval, measured in milliseconds. 
var skillCooldownInterval = 5000; 

//The skill's timer. 
var skillTimer; 

// The time on the current skill cooldown timer, 
//measured in milliseconds. 
var skillCooldownTime; 

// Use the Skill attack, which deals damage to all enemies 
// within a long range. 
// This is called when the user clicks the skill button. 
function clickSkill() {
    if (blockInput) 
        return;
    if (skillOnCooldown) 
        return; 
    // Calculate the skill's range. 
    var farEnd = skillRange * getGameWidth() + playerChar.getX() + playerChar.getWidth(); 
    // Damage all enemies within range. 
    enemies.forEach(function(part, index, arr){
        if (arr[index].getX() < farEnd) {
            hurtEnemy(arr[index], skillDamage); 
        }
    });    
    // Start the skill's cooldown. 
    skillOnCooldown = true;     
    skillCooldownTime = skillCooldownInterval; 
    skillTimer = setInterval(skillUpdate, 100);     
}

// The function used along with setInterval to implement the 
// skill attack's cooldown. 
function skillUpdate() {
    if (freeze) 
        return; 
    // Decrease the cooldown time. 
    skillCooldownTime -= 100;     
    if(skillCooldownTime <= 0) {
        /// If time's up, turn off cooldown. 
        $("#divCombatButton2").html(
            "Skill<br>Does 3 damage to range.");
        skillOnCooldown = false; 
        clearInterval(skillTimer); 
    } else {
        // Otherwise, display the cooldown time in the button. 
        $("#divCombatButton2").html(skillCooldownTime/1000);
    }
}

// The amount of hp healed when the player uses an item. 
var itemHealing = 3; 

// Use an item. This is called when the user clicks an item button. 
// Currently, all items just heal the player's health. 
// @param number The number of the combat button. 
function clickItem(number) {
    if(blockInput) 
        return; 
    // Check if the user has an item in that slot. 
    if(!items[number])
        return; 
    // Heal the player. 
    playerChar.hp += itemHealing; 
    if (playerChar.hp > playerMaxHP) 
        playerChar.hp = playerMaxHP; 
    // Remove the item from that slot. 
    items[number] = null; 
    $("#divCombatButton" + number).empty();
}

//hide item
$("#hiding").hide();

// Adds an item to the nearest empty item slot. 
// If there is no room, no item is added. 
// @param The name of the item. 
function addItem(item) {
    var searching = true; 
   // Item slots are combat buttons 3-5. 
    for (var i = 3; i <= 5 && searching; i++) {
        if (!items[i]) {
            items[i] = item; 
            //show item
			$("#hiding").show();
            searching = false; 
        }
    }
}

// Changes the text in the dialogue box. 
// @param text The text that should appear in the dialogue box. 
function setDialogue(text) {
    $("#divDialogue").html(text);
    showDialogue();
}

// Checks whether dialogue should be loaded, and then loads it. 
function checkDialogue() {
    if (dialogue == null) 
        return; 
    for (var i = 1; i <= Object.keys(dialogue).length; i++) {
        if (combatPhase == dialogue["dialogue" + i]["combatphase"]) {
            if (spawnedCount == dialogue["dialogue" + i]["enemynumber"] 
                || (spawnedCount > Object.keys(enemyData).length 
                    && dialogue["dialogue" + i]["enemynumber"] 
                    > Object.keys(enemyData).length)) {
                
                setDialogue(dialogue["dialogue" + i]["text"]);
            }
        }
    }
}

// TRIVIA FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// The number of questions asked by each miniboss. 
var miniBossQuestions = 1; 

// The number of questions asked by the last boss in a level. 
var bossQuestions = 3; 

// The damage dealt to the player for each wrong answer. 
var triviaDamage = 1; 

// The delay before the next question loads. 
var nextQuestionDelay = 1200; 

// The number of questions remaining in this trivia phase. 
var remainingQuestions; 

// The answer button corresponding with the correct answer. 
var correctAnswer;

// Starts each trivia portion of the level. 
function startTrivia() {
    // Load the trivia windows and buttons. 
    toggleButtons(true);
    hideDialogue();
    showQuestion();
    // Set the number of questions. 
    if (remainingBosses > 0) {
        // The boss is a miniboss. 
        remainingQuestions = miniBossQuestions; 
    } else {
        // The boss is the last boss in a level. 
        remainingQuestions = bossQuestions; 
    }
    // Load the next question. 
    nextQuestion();
}

// Stores the value of setTimeout for loading the next question. 
var questionTimer; 

// Called when the player clicks on a question button. 
// @param number The number of the question button. 
function clickAnswer(number) {    
    if (blockInput) 
        return;     
    // Check if the answer has already been selected. 
    if($("#divAnswer" + number).hasClass("classAnswerEliminated") 
       || $("#divAnswer" + number).hasClass("classAnswerCorrect"))
        return; 
    // If the answer is correct...
    if (number == correctAnswer) {
        // Mark the answer as correct. 
        markCorrectButton(number); 
        // Set the timer for the next question. 
        blockInput = true; 
        questionTimer = setTimeout(nextQuestion, nextQuestionDelay); 
    } else {
        // Otherwise, mark the answer as wrong and damage the player.
        eliminateButton(number);
        hurtPlayer(triviaDamage);
    }
}

// Tracks which questions have already been used in this level. 
var usedQuestions = []; 

// Loads the next question. 
function nextQuestion() {
    blockInput = false;
    // If there are remaining questions, load it. 
    if (remainingQuestions > 0) {
		
        resetAnswerButtons();
        
        // Get the random question number. 
        var questionNumber;
        var repeatQuestion; 
        do {
            questionNumber = randomQuestionNumber();
            repeatQuestion = false; 
            usedQuestions.forEach(function(part, index, arr){
                if (questionNumber == usedQuestions[index]){
                    repeatQuestion = true; 
                }
            });
        } while(repeatQuestion); 
        		
        // Assign which answer should go in which slot 
        correctAnswer = d4();
        var wrong = []; 
        for (var i = 2; i <= 4; i++) {
            var slot; 
            do {
                slot = d4();
            } while(slot == correctAnswer 
                    || slot == wrong[2] 
                    || slot == wrong[3] 
                    || slot == wrong[4]);
            wrong[i] = slot; 
        }
        
		// Setting the question data into the interface. 
		$("#divQuestion").html(
            questions[keysQuestions[questionNumber]].question);
        $("#divAnswer" + correctAnswer).html(
            questions[keysQuestions[questionNumber]].answer1);
        $("#divAnswer" + wrong[2]).html(
            questions[keysQuestions[questionNumber]].answer2);
        $("#divAnswer" + wrong[3]).html(
            questions[keysQuestions[questionNumber]].answer3);
        $("#divAnswer" + wrong[4]).html(
            questions[keysQuestions[questionNumber]].answer4);
        
        remainingQuestions--; 
    } else if (remainingBosses > 0) {
        // Otherwise... 
        // If it was just a miniboss...
        // Give the player an item. 
        addItem("PLACEHOLDER ITEM<br>Heals up to 3 hp");
        // Delete the boss character. 
        bossChar = null; 
        // Return to combat gameplay. 
        freeze = false; 
        toggleButtons(false);
        hideQuestion();
        startCombat();
    } else {
        // Otherwise, that was the last boss, so the level is over.  
        levelComplete();
    }
}

// Random number, 1-4
// @return integer 1-4
function d4() {
    return 1 + Math.floor(Math.random() * 4);
}

// The total questions. 
// @return A random key for the questions data object. 
function randomQuestionNumber() {
    return Math.floor(Math.random() * keysQuestions.length);
}

// Visibly marks an answer button as the correct answer. 
// @param number The answer button's number. 
function markCorrectButton(number) {
    $("#divAnswer" + number).addClass("classAnswerCorrect");
}

// Visibly marks an answer button as an incorrect answer. 
// @param number The answer button's number. 
function eliminateButton(number) {
    $("#divAnswer" + number).addClass("classAnswerEliminated");
}

// Remove all right and wrong style classes from all answer buttons. 
function resetAnswerButtons() {
    for(var i = 1; i <= 4; i++) {
        $("#divAnswer" + i).removeClass(
            "classAnswerCorrect classAnswerEliminated");
        $("#divAnswer" + i).html("");
    }
}    

// SETUP CODE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Set events for the combat buttons. 
$("#divCombatButton1").click(function(){clickEat();});
$("#divCombatButton2").click(function(){clickSkill();});
for(let i = 3; i <= 5; i++) {
    $("#divCombatButton" + i).click(function(){clickItem(i);});
}

// Set events for the trivia buttons. 
for(let i = 1; i <= 4; i++) {
    $("#divAnswer" + i).click(function(){clickAnswer(i);});
}

$("#divTempClear").click(function(){nextQuestion();});

// Set up pause. 
$("#divPauseButton").click(function(){
    if ($("#divPauseScreen").css("display") == "none") {
        togglePause(true);
    }
});
$("#divPauseResume").click(function(){togglePause(false);});
$("#divPauseRestart").click(function(){restartLevel()});

// Set up game over. 
$("#divGameOverRestart").click(function(){restartLevel()});

