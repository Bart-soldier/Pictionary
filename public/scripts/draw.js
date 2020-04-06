// draw.js

var url;
var canvas;
var context;
var drawing;
var alreadyWarned;

$(document).ready(function(){
  //url = 'http://localhost:8080/play';
  url = 'https://clerc-dejaham-pictionary.herokuapp.com/play';
  canvas = document.getElementById("whiteboard");
  context = canvas.getContext("2d");
  // Largeur du trait par défaut
  context.lineWidth = 1;
  // Couleur par défaut
  context.strokeStyle = "#000000";

  drawing = false;
  alreadyWarned = false;
  clientNb = -1;

  // Connexion à socket.io
  const socket = io.connect(url);
  // Confirmation de connexion
  socket.on('check', function(data) {
    alert(data.message);
    alreadyWarned = true;
    clientNb = data.clientNb;
  });

  socket.on('checkAll', function(message) {
    if(!alreadyWarned) {
      alert(message);
    }
    alreadyWarned = false;
  })

  /*************************************
  Pour le client qui dessine
  **************************************/

  // Pour le moment, le premier client connecté est le seul à pouvoir dessiner
  if(clientNb == 1) {
    alert('I am ' + clientNb);
    // Pour chaque évènement de la souris

    // On clic avec la souris
    $("#whiteboard").mousedown(function(e){
      // On dessine
      drawing = true;
      // Commence un nouveau chemin (avec la couleur et la largeur actuelle)
      context.beginPath();

      // Début du chemin au point actuel
      var x = e.pageX - canvas.offsetLeft;
      var y = e.pageY - canvas.offsetTop;
      context.moveTo(x,y);

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'mousedown', x: x, y: y});
    })

    // On relâche avec la souris
    $("#whiteboard").mouseup(function(e){
      // On arrête de dessiner
      drawing = false;

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'mouseup'});
    })

    // On sort de la zone de dessin
    $("#whiteboard").mouseout(function(e){
      // On arrête de dessiner
      drawing = false;

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'mouseout'});
    })

    // On bouge la souris
    $("#whiteboard").mousemove(function(e){
      // Si on est entrain de dessiner
      if (drawing == true) {
        // On récupère la position actuelle
        var x = e.pageX - canvas.offsetLeft;
        var y = e.pageY - canvas.offsetTop;

        // On dessine une ligne entre les dernières coordonnées
        // retenues et la position actuelle
        context.lineTo(x, y);
        context.stroke();

        // On envoi un message au serveur
        socket.emit('drawingAction', {type: 'mousemove', x: x, y: y});
      }
    })

    // Pour chaque boutons

    $("#eraseButton").click(function(){
      context.clearRect(0, 0, canvas.width, canvas.height);

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'erase'});
    })

    $("#thinButton").click(function(){
      context.beginPath();
      context.lineWidth = 1;

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'thin'});
    })


    $("#thickButton").click(function(){
      context.beginPath();
      context.lineWidth = 10;

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'thick'});
    })

    $("#blackButton").click(function(){
      context.beginPath();
      context.strokeStyle = "#000000";

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'black'});
    })


    $("#redButton").click(function(){
      context.beginPath();
      context.strokeStyle = "#CC0000";

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'red'});
    })


    $("#greenButton").click(function(){
      context.beginPath();
      context.strokeStyle = "#00CC00";

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'green'});
    })


    $("#blueButton").click(function(){
      context.beginPath();
      context.strokeStyle = "#0000CC";

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'blue'});
    })
  }

  /*************************************
  Pour les autres clients
  **************************************/

  else {
    // Lorsqu'on reçoit une action liée au dessin
    socket.on('drawingAction', function(data) {
      switch(data.type) {
        case 'mousedown':
          // Commence un nouveau chemin (avec la couleur et la largeur actuelle)
          context.beginPath();

          // Début du chemin au point actuel
          context.moveTo(data.x, data.y);
          break;

        /*case 'mouseup':
          // On arrête de dessiner
          drawing = false;
          break;

        case 'mouseout':
          // On arrête de dessiner
          drawing = false;
          break;*/

        case 'mousemove':
          // On dessine une ligne entre les dernières coordonnées
          // retenues et la position actuelle
          context.lineTo(data.x, data.y);
          context.stroke();
          break;

        case 'erase':
          context.clearRect(0, 0, canvas.width, canvas.height);
          break;

        case 'thin':
          context.beginPath();
          context.lineWidth = 1;
          break;

        case 'thick':
          context.beginPath();
          context.lineWidth = 10;
          break;

        case 'black':
          context.beginPath();
          context.strokeStyle = "#000000";
          break;

        case 'red':
          context.beginPath();
          context.strokeStyle = "#CC0000";
          break;

        case 'green':
          context.beginPath();
          context.strokeStyle = "#00CC00";
          break;

        case 'blue':
          context.beginPath();
          context.strokeStyle = "#0000CC";
      }
    });
  }
})
