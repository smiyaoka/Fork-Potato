// UI Functions
function swapButtons() {
    if ($("#divCombatButtons").css("display") == "flex") {
        $("#divCombatButtons").css("display", "none");
        $("#divAnswerButtons").css("display", "flex");
    } else {
        $("#divCombatButtons").css("display", "flex");
        $("#divAnswerButtons").css("display", "none");
    }                
}

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

// Combat Functions
function clickEat() {
    if (blockInput) 
        return;     
    var eatRange = 80; 
    var farEnd = eatRange + playerChar.x + playerChar.width; 
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
    if (target != null) {
        var eatDamage = 1; 
        hurtEnemy(target, eatDamage);
    }
}

var skillCooldown = false; 
var skillCooldownTime = 5000; 
var skillTimer; 
function clickSkill() {
    if (blockInput) 
        return;
    if (skillCooldown) 
        return; 
    
    var skillDamage = 3; 
    var skillRange = 350; 
    var farEnd = skillRange + playerChar.x + playerChar.width; 
    enemies.forEach(function(part, index, arr){
        if (arr[index].x < farEnd) {
            hurtEnemy(arr[index], skillDamage); 
        }
    });    
    skillCooldown = true;     
    hurtEnemy(skillDamage);
    skillCooldownTime = 5000; 
    skillTimer = setInterval(skillUpdate, 100);     
}

function skillUpdate() {
    if (freeze) 
        return; 
    skillCooldownTime -= 100; 
    console.log(skillCooldownTime/1000); 
    if(skillCooldownTime <= 0) {
        $("#divCombatButton2").html("Eat<br>Does one damage.");
        skillCooldown = false; 
        clearInterval(skillTimer); 
    } else {
        $("#divCombatButton2").html(skillCooldownTime/1000);
    }
}

function clickItem(number) {
    if(blockInput) 
        return; 
    if(!items[number])
        return; 
    playerChar.hp += 3; 
    if (playerChar.hp > playerMaxHP) 
        playerChar.hp = playerMaxHP; 
    //hurtEnemy(itemDamage[items[number]]); 
    items[number] = null; 
    $("#divCombatButton" + number).empty();
}

function addItem(item) {
    var searching = true; 
    for (var i = 3; i <= 5 && searching; i++) {
        if (!items[i]) {
            items[i] = item; 
            $("#divCombatButton" + i).html(item);
            searching = false; 
        }
    }
}

function hurtEnemy(target, damage) {
    target.hp -= damage; 
}

function hurtPlayer() {
    playerChar.hp -= enemyPower; 
    refresh();
    if (playerChar.hp <= 0) {
        gameOver();
    }
}

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

function levelComplete() {
    blockInput = true; 
    console.log("LEVEL COMPLETE"); // DEBUG
    toggleDialogue();
    $("#divDialogue").html("Level Complete");
}

function gameOver() {
    blockInput = true; 
    console.log("GAME OVER"); // DEBUG
    toggleDialogue();
    $("#divDialogue").html("Game Over");
}

// Trivia Functions 
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
        $("#divQuestion").html("PLACEHOLDER QUESTION");
        $("#divAnswer1").html("PLACEHOLDER ANSWER 1");
        $("#divAnswer2").html("PLACEHOLDER ANSWER 2");
        $("#divAnswer3").html("PLACEHOLDER ANSWER 3");
        $("#divAnswer4").html("PLACEHOLDER ANSWER 4");
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
    playerChar = new component(80, 80, "images/placeholder/player.gif", 30, 190, "image", playerMaxHP);
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

function component(width, height, color, x, y, type, initialHP) {
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
    this.speedX = 0;
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
}

function updateGameArea() {
    if (freeze) 
        return;     
    background.newPos();            
    playerChar.newPos();  
        
    enemies.forEach(function(part, index, arr){
        arr[index].speedX = -2; 
        arr[index].newPos();
        if (playerChar.collided(arr[index])) {
            hurtEnemy(arr[index], 100);
        }
    });
    
    killEnemies();
    
    if (bossChar != null) {
        bossChar.speedX = -2; 
        bossChar.newPos();
        if (bossChar.x <= bossStop) {
            startTrivia();
            freeze = true; 
        }
    }    
    refresh();
}

function refresh() {
    gameArea.clear();
    background.update();
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
        enemies.push(new component(80, 80, "images/placeholder/enemy.gif", 480, 190, "image", enemyMaxHP));
        remainingEnemies --; 
    } else if (bossChar == null) {
        if (remainingBosses == 1) {
            bossChar = new component(80, 80, "images/placeholder/final.gif", 480, 190, "image", 0); 
        } else {
            bossChar = new component(80, 80, "images/placeholder/potato.gif", 480, 190, "image", 0); 
        }        
        remainingBosses--; 
    }
}

$("#divLevelArea").ready(startGame);




// Combat Script
var blockInput = false; 

var playerMaxHP = 10; 
var enemyMaxHP = 3; 
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
var correctAnswer = 4; 
var nextQuestionDelay = 3000; 
var triviaDamage = 1; 
var remainingQuestions = 2; 

for(let i = 1; i <= 4; i++) {
    $("#divAnswer" + i).click(function(){clickAnswer(i);});
}

$("#divTempClear").click(function(){nextQuestion();});


