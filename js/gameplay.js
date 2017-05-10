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
    var eatDamage = 1; 
    hurtEnemy(eatDamage);
}

function clickSkill() {
    if (blockInput) 
        return;     
    var skillDamage = 3; 
    hurtEnemy(skillDamage);    
}

function hurtEnemy(damage) {
    enemyHP -= damage; 
    console.log ("enemyHP: " + enemyHP); // DEBUG
    if (enemyHP <= 0) {
        if (remainingEnemies > 0) {
            remainingEnemies--; 
            console.log("remainingEnemies: " + remainingEnemies);
            enemyHP = 5; // PLACEHOLDER, should be nextHP
        } else {
            startTrivia();
        }
    }
}

function hurtPlayer() {
    playerHP -= enemyPower; 
    console.log("playerHP: " + playerHP); //DEBUG
    if (playerHP <= 0) {
        gameOver();
    }
}

function startTrivia() {
    swapButtons();
    toggleQuestion();
    nextQuestion();
}

function levelComplete() {
    blockInput = true; 
    console.log("LEVEL COMPLETE"); // DEBUG
}

function gameOver() {
    blockInput = true; 
    console.log("GAME OVER"); // DEBUG
}

function clickItem(number) {
    if(blockInput) 
        return; 
    if(!items[number])
        return; 
    hurtEnemy(itemDamage[items[number]]); 
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
            console.log(i + " " + items[i]);
        }
    }
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
    console.log("RQ " + remainingQuestions); 
    if (remainingQuestions > 0) {
        remainingQuestions--; 
        blockInput = false; 
        resetAnswerButtons();
        // PLACEHOLDER, load next question
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
    addItem("PLACEHOLDER");
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
var enemyChar; 

function startGame() {
    playerChar = new component(80, 80, "images/placeholder/char.gif", 30, 190, "image");
    background = new component(800, 310, "images/placeholder/1.png", 0, 0, "background");
    
    enemyChar = new component(80, 80, "images/placeholder/char.gif", 300, 190, "image");
    
    gameArea.start();
    
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

function component(width, height, color, x, y, type) {
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
        if (enemyChar == null) {
            return false; 
        }
        var myRight = this.x + (this.width); 
        var otherLeft = obj.x; 
        return myRight > otherLeft;
    }
    
}

function updateGameArea() {
    if (playerChar.collided(enemyChar)) {
        enemyChar = null; 
    }
    
    gameArea.clear();
    background.speedX = -1;
    background.newPos();    
    background.update();
    playerChar.newPos();  
    playerChar.update();
    if (enemyChar != null) {
        enemyChar.speedX = -1; 
        enemyChar.newPos();  
        enemyChar.update();
    }
}


$("#divLevelArea").ready(startGame);




// Combat Script
var blockInput = false; 

var playerHP = 2; 
var enemyHP = 5; 
var enemyPower = 1; 
var remainingEnemies = 1; 
var items = []; 
var itemDamage = []; 
itemDamage["PLACEHOLDER"] = 2; 

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


