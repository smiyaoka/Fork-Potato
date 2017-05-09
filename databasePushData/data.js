var Name = document.getElementById("Name");
var submit1 = document.getElementById("submit1");


  var config = {
    apiKey: "AIzaSyB8EekPhs6qYLXCxCi0oyypG3f25MlBFFY",
    authDomain: "project-fork-and-potato.firebaseapp.com",
    databaseURL: "https://project-fork-and-potato.firebaseio.com",
    projectId: "project-fork-and-potato",
    storageBucket: "project-fork-and-potato.appspot.com",
    messagingSenderId: "119574546255"
  };
  firebase.initializeApp(config);
console.log(firebase);

    var database = firebase.database();
    var ref = database.ref('scores');
    
    

function submitClick() {
        var data = {
        name: document.getElementById("initialInput").value,
        score: 43
    }
    ref.push(data);

}