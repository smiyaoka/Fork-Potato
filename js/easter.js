

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyB8EekPhs6qYLXCxCi0oyypG3f25MlBFFY",
    authDomain: "project-fork-and-potato.firebaseapp.com",
    databaseURL: "https://project-fork-and-potato.firebaseio.com",
    projectId: "project-fork-and-potato",
    storageBucket: "project-fork-and-potato.appspot.com",
    messagingSenderId: "119574546255"
  };
  
  firebase.initializeApp(config);
  
var database = firebase.database();
var ref = database.ref('users');

(function() {

  var mouseTimer;
  function mouseDown() { 
      mouseUp();
      mouseTimer = window.setTimeout(execMouseDown,5000); //set timeout to fire in 2 seconds when the user presses mouse button down
  }

  function execMouseDown() { 
      
				var user1 = firebase.auth().currentUser;
				console.log(firebase.auth().currentUser.uid);
				if(user1) {
					firebase.database().ref('users/' + firebase.auth().currentUser.uid).update({ easter: "1" });
				});
				} else {
				 
				}
				// console.log(firebase.auth().currentUser.uid);
		
 }

  var easterButton = document.getElementById("easterBtn");
  easterButton.addEventListener("mousedown", mouseDown);
   //listen for mouse up event on body, not just the element you originally clicked on
  
}());