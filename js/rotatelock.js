window.addEventListener("orientationchange", function() {
    updateRotation();
});

function updateRotation() {
    var body = document.body;
    body.style.transformOrigin = "top left";
    switch(window.orientation) {
        case 0: 
            body.style.transform =""; 
            body.style.marginLeft = 0; 
            body.style.marginLeft = "0px";
            break;
        case 90: 
            body.style.transform ="rotate(-90deg)"; 
            body.style.marginLeft = body.clientHeight + "px";
            
            break;
        case -90: 
            body.style.transform ="rotate(90deg)"; 
            body.style.marginLeft = body.clientHeight + "px";
            break;
    }
}