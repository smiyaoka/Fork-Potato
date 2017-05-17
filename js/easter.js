

(function() {

  var mouseTimer;
  function mouseDown() { 
      mouseUp();
      mouseTimer = window.setTimeout(execMouseDown,5000); //set timeout to fire in 2 seconds when the user presses mouse button down
  }

  function execMouseDown() { 
      var ref = new Firebase("https://project-fork-and-potato.firebaseio.com/users");
      
      var usersRef = firebase.auth().currentUser.child("users");
      if(user) {
          usersRef.set(easter: "1");
      } else {
          usersRef.set(easter: "0");
      }
  }

  var easterButton = document.getElementById("easterBtn");
  easterButton.addEventListener("mousedown", mouseDown);
   //listen for mouse up event on body, not just the element you originally clicked on
  
}());