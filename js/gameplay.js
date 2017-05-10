// UI Functions (and debug code) 
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

// UI Debug Script 
/*
$("#divLevelArt").click(function(){
    swapButtons();
    toggleDialogue(); 
});
*/

// Combat Script
var blockInput = false; 

var playerHP = 2; 
var enemyHP = 5; 
var enemyPower = 1; 
var remainingEnemies = 1; 

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


