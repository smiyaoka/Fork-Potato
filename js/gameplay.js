//connect to firebase.
 var ref = new Firebase("https://project-fork-and-potato.firebaseio.com/questions");

// UI FUNCTIONS 

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

// GAME FLOW FUNCTIONS 

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

// COMBAT FUNCTIONS

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
        $("#divCombatButton2").html(skillCooldownInterval/1000);
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


// TRIVIA FUNCTIONS 


function startTrivia() {
    swapButtons();
    toggleQuestion();
    if (remainingBosses > 0) {
        remainingQuestions = 1; 
    } else {
        remainingQuestions = 3; 
    }    
    nextQuestion();
}



function clickAnswer(number) {    
    if (blockInput) 
        return;     
    if($("#divAnswer" + number).hasClass("classAnswerEliminated") || $("#divAnswer" + number).hasClass("classAnswerCorrect"))
        return; 
    
    if (number == correctAnswer) {
        markCorrectButton(number);        
        blockInput = true; 
        setTimeout(nextQuestion, nextQuestionDelay);         
    } else {
        eliminateButton(number);
        hurtPlayer(triviaDamage);
    }
}

function nextQuestion() {
    blockInput = false;
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
        addItem("PLACEHOLDER ITEM<br>Heals up to 3 hp");
        bossChar = null; 
        freeze = false; 
        swapButtons();
        toggleQuestion();
        startCombat();
    } else {
        levelComplete();
    }
}

function markCorrectButton(number) {
    $("#divAnswer" + number).addClass("classAnswerCorrect");
}

function eliminateButton(number) {
    $("#divAnswer" + number).addClass("classAnswerEliminated");
}

function resetAnswerButtons() {
    for(var i = 1; i <= 4; i++) {
        $("#divAnswer" + i).removeClass("classAnswerCorrect classAnswerEliminated");
    }
}    

// Debug Functions and Script
function addRandomItem() {
    // IGNORE
}
$("#divLevelArea").click(function(){
    //spawnEnemy();
});

// UI Debug Script 
/*
$("#divLevelArea").click(function(){
    swapButtons();
    toggleDialogue(); 
});
*/

// Side-Scrolling
var playerChar;
var myBackground;
var enemies = []; 
var bossChar; 
var bossStop = 350; 

function startGame() {
    playerChar = new component(80, 80, "images/placeholder/player1.gif", 30, 190, "image", playerMaxHP);
    background = new component(800, 310, "images/placeholder/1.png", 0, 0, "background");
    background.speedX = -1;
            
    startCombat();
    gameArea.start();    
}

function startCombat() {
    remainingEnemies = 3; 
    spawnEnemy();
}

var gameArea = {
    canvas : $("#divLevelArea").children("canvas")[0],
    start : function() {
        this.canvas = $("#divLevelArea").children("canvas")[0];
        this.canvas.width = 480; 
        this.canvas.height = 300; 
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 10);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    }
}

function component(width, height, color, x, y, type, initialHP, speedX) {
    this.boss = false; 
    this.hp = (initialHP == null) ? 1 : initialHP; 
    if (initialHP == 0) {
        this.boss = true; 
    }
    this.type = type;
    if (type == "image" || type == "background") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.speedX = (speedX == null) ? 0 : speedX; 
    this.speedY = 0;    
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = gameArea.context;
        if (type == "image" || type == "background") {
            ctx.drawImage(this.image, 
                this.x, 
                this.y,
                this.width, this.height);
            if (!this.boss) {
                ctx.font="20px Georgia";
                ctx.fillText(this.hp,this.x,this.y - 10);
            }
        if (type == "background") {
            ctx.drawImage(this.image, 
                this.x + this.width, 
                this.y,
                this.width, this.height);
        }
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.type == "background") {
            if (this.x == -(this.width)) {
                this.x = 0;
            }
        }
    }
    this.collided = function(obj) {
        if (obj == null) {
            return false; 
        }
        var myRight = this.x + (this.width); 
        var otherLeft = obj.x; 
        return myRight > otherLeft;
    }
    this.autoAttackLoop; 
}

function skillUpdate() {
    if (freeze) 
        return; 
    skillCooldownInterval -= 100; 
    if(skillCooldownInterval <= 0) {
        $("#divCombatButton2").html("Skill<br>Does 3 damage to range.");
        skillOnCooldown = false; 
        clearInterval(skillTimer); 
    } else {
        $("#divCombatButton2").html(skillCooldownInterval/1000);
    }
}

function autoAttackUpdate(enemy) {
    if (freeze) 
        return; 
    hurtEnemy(enemy, autoAttackDamage); 
    hurtPlayer(enemyPower);
}

var autoAttackInterval = 800; 
var autoAttackDamage = 1; 
function updateGameArea() {
    if (freeze) 
        return;     
    background.newPos();            
    playerChar.newPos();  
        
    enemies.forEach(function(part, index, arr){
        arr[index].newPos();
        if (playerChar.collided(arr[index])) {
            if (arr[index].autoAttackLoop == null) {
                arr[index].speedX = 0; 
                autoAttackUpdate(arr[index]);
                arr[index].autoAttackLoop = setInterval(function(){
                    autoAttackUpdate(arr[index]);
                }, autoAttackInterval); 
            }
        }
    });
    
    killEnemies();
    
    if (bossChar != null) {
        bossChar.newPos();
        if (bossChar.x <= bossStop) {
            startTrivia();
            freeze = true; 
        }
    }    
    refresh();
}

var imageNumber = 0; // number of images to animate
var imgSpeedCount = 0; // the lower the faster char animates, adjust in refresh()

//animating player 
function animate() {

	imageNumber++
	if(imageNumber == 5){
		imageNumber = 1;
    }
	playerChar.image.src = 'images/placeholder/player' + imageNumber + '.gif'
}

function refresh() {
    gameArea.clear();
    background.update();
	
    imgSpeedCount++; // the lower this number, the faster character move.
    if(imgSpeedCount == 5) {
	animate();
	imgSpeedCount = 0;
    }
    playerChar.update();
    enemies.forEach(function(part, index, arr){
        arr[index].update();        
    });
    if (bossChar != null) {
        bossChar.update();
    }
}

function killEnemies() {
    enemies.forEach(function(part, index, arr){
        if (arr[index].hp <= 0) {
            clearInterval(arr[index].autoAttackLoop); 
            arr.splice(index, 1); 
            spawnEnemy();
            while(arr[index] != null && arr[index].hp <= 0) {
                arr.splice(index, 1); 
                spawnEnemy();
            }
        }
    });
}

var freeze = false; 

function spawnEnemy() {
    if (remainingEnemies > 0) {
        enemies.push(new component(80, 80, "images/placeholder/enemy.gif", 480, 190, "image", enemyMaxHP, enemySpeedX));
        remainingEnemies --; 
    } else if (bossChar == null) {
        if (remainingBosses == 1) {
            bossChar = new component(80, 80, "images/placeholder/final.gif", 480, 190, "image", 0, enemySpeedX); 
        } else {
            bossChar = new component(80, 80, "images/placeholder/potato.gif", 480, 190, "image", 0, enemySpeedX); 
        }        
        remainingBosses--; 
    }
}

$("#divLevelArea").ready(startGame);




// Combat Script
var blockInput = false; 

var playerMaxHP = 10; 
var enemyMaxHP = 3; 
var enemySpeedX = -1; 
var enemyPower = 1; // remove later 
var remainingEnemies = 3; // defined earlier 
var items = []; // this is meh - change to object later 
var itemDamage = []; // this is meh - change to object later 
itemDamage["PLACEHOLDER"] = 2; // 
var remainingBosses = 2; // needs to be defined when level data loads 

$("#divCombatButton1").click(function(){clickEat();});
$("#divCombatButton2").click(function(){clickSkill();});
for(let i = 3; i <= 5; i++) {
    $("#divCombatButton" + i).click(function(){clickItem(i);});
}


// Trivia Script 
var correctAnswer = 1; 
var nextQuestionDelay = 1200; 
var triviaDamage = 1; 
var remainingQuestions = 2; 

for(let i = 1; i <= 4; i++) {
    $("#divAnswer" + i).click(function(){clickAnswer(i);});
}

$("#divTempClear").click(function(){nextQuestion();});


