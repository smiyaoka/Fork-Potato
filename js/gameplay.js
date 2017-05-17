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

// Grab all data for this level, and then start the game. 
refLevel.once('value').then(function(data) {
    level = data.val();
    dialogue = level["dialogue"];
    startGame();
});

// UI FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Switches between the combat buttons and the trivia buttons. 
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
var enemySpeedX = -1; 

// The width of the game area. 
var gameWidth;  

// The height of the game area. 
var gameHeight; 

// Calculates gameWidth and gameHeight differently depending on screen orientation. 
if ($(window).height() > $(window).width()) {
    // Initially portrait. 
    gameWidth = 480; 
    gameHeight = gameWidth / $(window).width() * $(window).height() * 0.67; 
} else {
    // Initially landscape. 
    gameHeight = 480; 
    gameWidth = gameHeight / $(window).height() * $(window).width() * 0.67; 
}

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
var yFromBottom = 80; 

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
    playerChar = new component(130, 130, "images/placeholder/player1.gif", 
                               30, gameHeight - yFromBottom - 130, "combat", 0, playerMaxHP);
    background = new component(800, 600, "images/placeholder/1.png", 
                               0, gameHeight - 600, "background");
    background.speedX = -1;
    
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
// @param img The image for the component. . 
// @param x The initial x position of the component. 
// @param y The initial y position of the component. 
// @param type The type of the component as a string. 
// @param speedX The initial horizontal velocity of the component. 
// @param initialHP The initial hp of the component. 
function component(width, height, img, x, y, type, speedX, initialHP) {
    // The initial hp. Set it to 1 if a value is not provided. 
    this.hp = (initialHP == null) ? 1 : initialHP; 
    // Set the component's type. 
    this.type = type;
    
    // Set the image. 
    this.image = new Image();
    this.image.src = img; 
    
    // Set the width and height. 
    this.width = width;
    this.height = height;
    
    // speedX is the horizontal velocity. 
    // If a speedX is not provided, set it to 0. 
    this.speedX = (speedX == null) ? 0 : speedX; 
    // speedY is the vertical velocity. 
    this.speedY = 0;
    
    // Set the initial position. 
    this.x = x;
    this.y = y;    
    
    // Called to refresh the component. 
    this.update = function() {
        ctx = gameArea.context;
        // Draw the image. 
        ctx.drawImage(this.image, 
            this.x, 
            this.y,
            this.width, this.height); 
        // If it's a combat character, draw an hp marker. 
        if (type == "combat") {
            ctx.font="20px Georgia";
            ctx.fillText(this.hp,this.x,this.y - 10);
        } else if (type == "background") {
            // If it's a background, draw the image again. 
            ctx.drawImage(this.image, 
                this.x + this.width, 
                this.y,
                this.width, this.height);
        }
    }
    // Called to re-calculate the component's position. 
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        // If the component is a background, make it repeat. 
        if (this.type == "background") {
            if (this.x == -(this.width)) {
                this.x = 0;
            }
        }
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
        var myRight = this.x + (this.width); 
        var otherLeft = obj.x; 
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
function autoAttackUpdate(enemy) {
    if (freeze) 
        return; 
    hurtEnemy(enemy, autoAttackDamage); 
    hurtPlayer(autoAttackDamage);
}

// The x position at which a boss or miniboss stops moving. 
var bossStop = 320; 

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
        if (bossChar.x <= bossStop) {
            // Start the trivia gameplay. 
            startTrivia();
            freeze = true; 
        }
    }    
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
	
    // The lower this number, the faster character move.
    imgSpeedCount++; 
    if(imgSpeedCount == 5) {
	animate();
	imgSpeedCount = 0;
    }
    
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

// The number of images to animate. 
var imageNumber = 0; 

// the lower the faster char animates, adjust in refresh()
var imgSpeedCount = 0; 

//animating player 
function animate() {
	imageNumber++
	if(imageNumber == 5){
		imageNumber = 1;
    }
	playerChar.image.src = 'images/placeholder/player' + imageNumber + '.gif'
}

// Spawns an enemy, miniboss, or boss. 
function spawnEnemy() {
    
    // Update the dialogue box. 
    hideDialogue();
    checkDialogue();
    
    // If there are still enemies left in this combat phase. 
    if (spawnedCount <= Object.keys(enemyData).length) {
        // Spawn a regular enemy. 
        enemies.push(new component(130, 130, "images/placeholder/enemy.gif", 
                                   480, gameHeight - yFromBottom - 130, 
                                   "combat", enemySpeedX, enemyData["enemyhp" + spawnedCount]));
        spawnedCount ++; 
        // Otherwise, if a boss hasn't been spawned yet... 
    } else if (bossChar == null) {
        // IF this is the last boss in the level...
        if (remainingBosses == 1) {
            // Spawn the last boss in this level. 
            bossChar = new component(130, 130, "images/placeholder/final.gif", 
                                     480, gameHeight - yFromBottom - 130, 
                                     "boss", enemySpeedX); 
        } else {
            // Otherwise, spawn a miniboss. 
            bossChar = new component(130, 130, "images/placeholder/potato.gif", 
                                     480, gameHeight - yFromBottom - 130, 
                                     "boss", enemySpeedX); 
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
var eatRange = 80;  

// The amount of damage done by the eat attack. 
var eatDamage = 1; 

// Use the eat attack, which deals damage to the closest enemy 
// within a short range. 
// This is called when the user clicks the eat button. 
function clickEat() {
    if (blockInput) 
        return;    
    // Calculate the range of the attack. 
    var farEnd = eatRange + playerChar.x + playerChar.width;     
    // Determine the closest enemy within range 
    var target = null;
    enemies.forEach(function(part, index, arr){
        if (arr[index].x < farEnd) {
            if (target == null) {
                target = arr[index];
            } else if(arr[index].x < target.x) {
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
var skillRange = 350; 

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
    var farEnd = skillRange + playerChar.x + playerChar.width; 
    // Damage all enemies within range. 
    enemies.forEach(function(part, index, arr){
        if (arr[index].x < farEnd) {
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

// Adds an item to the nearest empty item slot. 
// If there is no room, no item is added. 
// @param The name of the item. 
function addItem(item) {
    var searching = true; 
   // Item slots are combat buttons 3-5. 
    for (var i = 3; i <= 5 && searching; i++) {
        if (!items[i]) {
            items[i] = item; 
            $("#divCombatButton" + i).html(item);
            searching = false; 
        }
    }
}

// Changes the text in the dialogue box. 
function setDialogue(text) {
    $("#divDialogue").html(text);
    showDialogue();
}

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
var remainingQuestions = 2; 

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
function d4() {
    return 1 + Math.floor(Math.random() * 4);
}

// The total number of questions in the database. 
var totalQuestions = 25; 

// The total questions. 
function randomQuestionNumber() {
    return Math.floor(Math.random() * totalQuestions);
}

// Visibly marks an answer button as the correct answer. 
function markCorrectButton(number) {
    $("#divAnswer" + number).addClass("classAnswerCorrect");
}

// Visibly marks an answer button as an incorrect answer. 
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

//$("#divLevelArea").ready(startGame);
$("#divTempClear").click(function(){nextQuestion();});

$("#divPauseButton").click(function(){togglePause(true);});
$("#divPauseResume").click(function(){togglePause(false);});
$("#divPauseRestart").click(function(){restartLevel()});

$("#divGameOverRestart").click(function(){restartLevel()});
