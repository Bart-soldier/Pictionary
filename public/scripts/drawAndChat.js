// draw.js

var canvas;
var context;
var drawing;
var pseudo;

$(document).ready(function(){
  // Récupération de la zone de dessin
  canvas = document.getElementById("whiteboard");
  context = canvas.getContext("2d");
  // Largeur du trait par défaut
  context.lineWidth = 1;
  // Couleur par défaut
  context.strokeStyle = "#000000";

  // Booléen utilisé pour savoir si on est entrain de dessiner ou non
  drawing = false;

  // URL locale
  //const url = 'http://localhost:8080/play';
  // URL Heroku
  const url = 'https://clerc-dejaham-pictionary.herokuapp.com/play';

  // Connexion socket.io
  const socket = io.connect(url);

  // On récupère le pseudo et on l'envoi au serveur
  pseudo = prompt('Quel est votre pseudo ?');
  // Tant que l'utilisateur n'a pas entré de pseudo
  while(pseudo == null) {
    pseudo = prompt('Vous devez entrer un pseudo.\nQuel est votre pseudo ?');
  }
  socket.emit('new_client', pseudo);

  /*************************************
  Chat textuel
  **************************************/

  // Quand un nouveau client se connecte
  socket.on('new_client', function(pseudo) {
    $('#zone_chat').prepend('<p><em>' + pseudo + ' a rejoint le Chat !</em></p>');
  });

  // Quand un nouveau client se déconnecte
  socket.on('leaving_client', function(pseudo) {
    $('#zone_chat').prepend('<p><em>' + pseudo + ' a quitté le Chat !</em></p>');
  });

  // Quand on reçoit un message du serveur
  socket.on('chatMessage', function(data) {
    $('#zone_chat').prepend('<p><strong>' + data.pseudo + '</strong> ' + data.message + '</p>');
  });

  // Quand on envoie le formulaire
  $('#formulaire_chat').submit(function () {
    var message = $('#message').val();
    // On envoie le message au serveur
    socket.emit('chatMessage', message);
    // Vide la zone de Chat et remet le focus dessus
    $('#message').val('').focus();
    // Permet de bloquer l'envoi "classique" du formulaire
    return false;
  });

  /*************************************
  Pour le client qui dessine
  **************************************/

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
    socket.emit('drawingAction', {type: 'mousedown', pseudo: pseudo, x: x, y: y});
  })

  // On relâche avec la souris
  $("#whiteboard").mouseup(function(e){
    // On arrête de dessiner
    drawing = false;

    // On envoi un message au serveur
    socket.emit('drawingAction', {type: 'mouseup', pseudo: pseudo});
  })

  // On sort de la zone de dessin
  $("#whiteboard").mouseout(function(e){
    // On arrête de dessiner
    drawing = false;

    // On envoi un message au serveur
    socket.emit('drawingAction', {type: 'mouseout', pseudo: pseudo});
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
      socket.emit('drawingAction', {type: 'mousemove', pseudo: pseudo, x: x, y: y});
    }
  })

  // Pour chaque boutons

  $("#eraseButton").click(function(){
    context.clearRect(0, 0, canvas.width, canvas.height);

    // On envoi un message au serveur
    socket.emit('drawingAction', {type: 'erase', pseudo: pseudo});
  })

  $("#thinButton").click(function(){
    context.beginPath();
    context.lineWidth = 1;

    // On envoi un message au serveur
    socket.emit('drawingAction', {type: 'thin', pseudo: pseudo});
  })


  $("#thickButton").click(function(){
    context.beginPath();
    context.lineWidth = 10;

    // On envoi un message au serveur
    socket.emit('drawingAction', {type: 'thick', pseudo: pseudo});
  })

  $("#blackButton").click(function(){
    context.beginPath();
    context.strokeStyle = "#000000";

    // On envoi un message au serveur
    socket.emit('drawingAction', {type: 'black', pseudo: pseudo});
  })


  $("#redButton").click(function(){
    context.beginPath();
    context.strokeStyle = "#CC0000";

    // On envoi un message au serveur
    socket.emit('drawingAction', {type: 'red', pseudo: pseudo});
  })


  $("#greenButton").click(function(){
    context.beginPath();
    context.strokeStyle = "#00CC00";

    // On envoi un message au serveur
    socket.emit('drawingAction', {type: 'green', pseudo: pseudo});
  })


  $("#blueButton").click(function(){
    context.beginPath();
    context.strokeStyle = "#0000CC";

    // On envoi un message au serveur
    socket.emit('drawingAction', {type: 'blue', pseudo: pseudo});
  })

  /*************************************
  Pour les autres clients
  **************************************/

  // Lorsqu'on reçoit une action liée au dessin
  socket.on('drawingAction', function(data) {
    // Si on est pas le client qui vient de réaliser cette action
    if(data.pseudo != pseudo) {
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
    }
  });
});
