//connect to firebase.
 var ref = new Firebase("https://project-fork-and-potato.firebaseio.com/questions");

// UI FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Switches between the combat buttons and the trivia buttons. 
function swapButtons() {
    if ($("#divCombatButtons").css("display") == "flex") {
        $("#divCombatButtons").css("display", "none");
        $("#divAnswerButtons").css("display", "flex");
    } else {
        $("#divCombatButtons").css("display", "flex");
        $("#divAnswerButtons").css("display", "none");
    }                
}

// Hides and unhides the question box at the top of the screen. 
function toggleQuestion() {
    /*
    if ($("#divDialogue").css("display") == "block") {
        $("#divDialogue").css("display", "none");
    } 
    */
    if ($("#divQuestion").css("display") == "block") {
        $("#divQuestion").css("display", "none"); 
    } else {
        $("#divQuestion").css("display", "block"); 
    }
}

// Hides and unhides the dialogue box at the top of the screen. 
function toggleDialogue() {
    /*
    if ($("#divQuestion").css("display") == "block") {
        $("#divQuestion").css("display", "none");
    } 
    */
    if ($("#divDialogue").css("display") == "block") {
        $("#divDialogue").css("display", "none"); 
    } else {
        $("#divDialogue").css("display", "block"); 
    }
}

// GAME FLOW FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Called when the level is successfully completed. 
// This function is currently a placeholder. 
function levelComplete() {
    blockInput = true; 
    console.log("LEVEL COMPLETE"); 
    toggleDialogue();
    $("#divDialogue").html("Level Complete");
}

// Called when the player fails the level. 
// This function is currently a placeholder. 
function gameOver() {
    blockInput = true; 
    freeze = true; 
    console.log("GAME OVER"); 
    toggleDialogue();
    $("#divDialogue").html("Game Over");
}

// COMBAT FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Freezes the level. 
var freeze = false; 

// Prevents the player from clicking certain buttons. 
// This doesn't freeze the entire level. 
var blockInput = false; 

// The player character's component. 
var playerChar;

// The background image's component. 
var myBackground;

// The array of enemy components. 
var enemies = []; 

// The boss character's component. 
var bossChar; 

// The array of items. 
var items = []; 

// The player's max hp. 
var playerMaxHP = 10; 

// Each enemy's max hp. 
var enemyMaxHP = 3; 

// Each enemy's initial horizontal velocity. 
var enemySpeedX = -1; 

// The number of enemies remaining in this combat phase. 
var remainingEnemies = 3; 

// The number of bosses remaining in this level. 
var remainingBosses = 2;

// Starts the level. 
function startGame() {
    // Set up the player and background components. 
    playerChar = new component(80, 80, "images/placeholder/player1.gif", 
                               30, 190, "combat", 0, playerMaxHP);
    background = new component(800, 310, "images/placeholder/1.png", 
                               0, 0, "background");
    background.speedX = -1;
    // Start the combat phase. 
    startCombat();
    // Start the canvas. 
    gameArea.start();    
}

// The number of enemies in each combat phase of the level. 
var enemiesPerCombat = 3; 

// Starts the combat phase.  
function startCombat() {
    // Set the number of enemies. 
    remainingEnemies = enemiesPerCombat; 
    // Spawn one enemy. 
    spawnEnemy();
}

// The area where the game characters are drawn. 
var gameArea = {
    canvas : $("#divLevelArea").children("canvas")[0],
    // Called to set up the canvas. 
    start : function() {
        this.canvas = $("#divLevelArea").children("canvas")[0];
        this.canvas.width = 480; 
        this.canvas.height = 300; 
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
var bossStop = 350; 

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
    // If there are still enemies left in this combat phase. 
    if (remainingEnemies > 0) {
        // Spawn a regular enemy. 
        enemies.push(new component(80, 80, "images/placeholder/enemy.gif", 
                                   480, 190, "combat", enemySpeedX,enemyMaxHP));
        remainingEnemies --; 
        // Otherwise, if a boss hasn't been spawned yet... 
    } else if (bossChar == null) {
        // IF this is the last boss in the level...
        if (remainingBosses == 1) {
            // Spawn the last boss in this level. 
            bossChar = new component(80, 80, "images/placeholder/final.gif", 
                                     480, 190, "boss", enemySpeedX); 
        } else {
            // Otherwise, spawn a miniboss. 
            bossChar = new component(80, 80, "images/placeholder/potato.gif", 
                                     480, 190, "boss", enemySpeedX); 
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
var correctAnswer = 1; 

// Starts each trivia portion of the level. 
function startTrivia() {
    // Load the trivia windows and buttons. 
    swapButtons();
    toggleQuestion();
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
        setTimeout(nextQuestion, nextQuestionDelay);         
    } else {
        // Otherwise, mark the answer as wrong and damage the player.
        eliminateButton(number);
        hurtPlayer(triviaDamage);
    }
}

// Loads the next question. 
function nextQuestion() {
    blockInput = false;
    // If there are remaining questions, load it. 
    if (remainingQuestions > 0) {
		
		//getting questions and answers from firebase 
		//question
		ref.child("question1/question").on("value", function(snapshot) {
			$("#divQuestion").html(snapshot.val());
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });
		
        //answer1(correct answer)
		ref.child("question1/answer1").on("value", function(snapshot) {
			$("#divAnswer1").html(snapshot.val());
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });
		
		//answer2
		ref.child("question1/answer2").on("value", function(snapshot) {
			$("#divAnswer2").html(snapshot.val());
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });
		
		//answer3
		ref.child("question1/answer3").on("value", function(snapshot) {
			$("#divAnswer3").html(snapshot.val());
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });
		
		//answer4
		ref.child("question1/answer4").on("value", function(snapshot) {
			$("#divAnswer4").html(snapshot.val());
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });
		
        remainingQuestions--; 
        resetAnswerButtons();
    } else if (remainingBosses > 0) {
        // Otherwise... 
        // If it was just a miniboss...
        // Give the player an item. 
        addItem("PLACEHOLDER ITEM<br>Heals up to 3 hp");
        // Delete the boss character. 
        bossChar = null; 
        // Return to combat gameplay. 
        freeze = false; 
        swapButtons();
        toggleQuestion();
        startCombat();
    } else {
        // Otherwise, that was the last boss, so the level is over.  
        levelComplete();
    }
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

$("#divLevelArea").ready(startGame);
$("#divTempClear").click(function(){nextQuestion();});

