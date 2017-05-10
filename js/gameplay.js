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


// Trivia Functions 
function clickButton(number) {
    if (number == correctAnswer) {
        markCorrectButton(number);
    } else {
        eliminateButton(number);
    }
}

function markCorrectButton(number) {
    $("#divAnswer" + number).addClass("classAnswerCorrect");
}

function eliminateButton(number) {
    $("#divAnswer" + number).addClass("classAnswerEliminated");
}

function nextQuestion() {
    for(var i = 1; i <= 4; i++) {
        $("#divAnswer" + i).removeClass("classAnswerCorrect classAnswerEliminated");
    }
}    

// UI Debug Script 
$("#divLevelArt").click(function(){
    swapButtons();
    toggleDialogue(); 
});

// Trivia Script 
var correctAnswer = 4; 

for(let i = 1; i <= 4; i++) {
    $("#divAnswer" + i).click(function(){clickButton(i);});
}

$("#divTempClear").click(function(){nextQuestion();});


