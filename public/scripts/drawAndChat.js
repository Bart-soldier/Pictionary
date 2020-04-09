// draw.js

var canvas;
var context;
var drawing;
var pseudo;
var drawingUser;
var nextDrawingUser;
var drawingWords = [null, null, null];

// URL locale
const url = 'http://localhost:8080/play';
// URL Heroku
//const url = 'https://clerc-dejaham-pictionary.herokuapp.com/play';

// Fonction asynchrone qui se charge de demander à l'utilisateur un pseudo
// jusqu'à ce que ce dernier soit unique et non nul
async function getUsername(socket) {
  // On récupère le pseudo
  pseudo = prompt('Quel est votre pseudo ?');
  // Booléen utilisé pour savoir si un pseudo est déjà utilisé
  var usernameAlreadyUsed = true;

  // Tant que l'utilisateur n'a pas entré de pseudo unique
  while(usernameAlreadyUsed) {
    // Tant que l'utilisateur n'a pas entré de pseudo non nul
    while(pseudo == null || pseudo == '') {
      pseudo = prompt("Vous devez entrer un pseudo.\nQuel est votre pseudo ?");
    }

    // On attend la promesse pour savoir si le pseudo est déjà utilisé
    usernameAlreadyUsed = await isUsernameTaken(socket);

    // Si le pseudo est déjà utilisé
    if(usernameAlreadyUsed) {
      pseudo = prompt(`Le pseudo ${pseudo} est déjà utilisé. Merci d'en choisir un autre.\nQuel est votre pseudo ?`);
    }
  }
}

// Promesse qui indique si le pseudo est déjà utilisé ou non en fonction de la réponse du seveur
// Sinon, elle indique que le pseudo est déjà utilisé si aucun message n'est reçu dans les 2 secondes
function isUsernameTaken(socket) {
  // On envoi le pseudo au serveur
  socket.emit('new_client', pseudo);

  return new Promise(resolve => {
    // Si on sait que le pseudo est déjà utilisé, on renvoi la promesse avec la valeur vrai
    socket.on('username_already_used', function() {
      resolve(true);
    });
    // Si on sait que le pseudo n'est pas déjà utilisé, on renvoi la promesse avec la valeur faux
    socket.on('username_not_taken', function() {
      resolve(false);
    });
    // Si le temps s'écoule, on renvoi la promesse avec la valeur vrai
    setTimeout(() => {
      resolve(true);
    }, 2000);
  })
}

// Met à jour l'affichage à l'écran de la listes de joueurs connectés dans leur ordre de tour à dessiner
function updateConnectedPlayers(listePseudos) {
  // On réinitialise la liste des joueurs connectés
  $('#connectedPlayers').replaceWith('<section id="connectedPlayers"></section>');

  // On parcourt tous les pseudos
  for(let i = 0; i < listePseudos.elements.length; i++) {
    // On ajoute le pseudo à la liste des joueurs connectés
    $('#connectedPlayers').append('<p><em><strong>' + listePseudos.elements[i] + '</strong></em></p><hr/>');
  }
}

$(document).ready(function(){
  // Récupération de la zone de dessin
  canvas = document.getElementById("whiteboard");
  context = canvas.getContext("2d");

  // Connexion socket.io
  const socket = io.connect(url);

  // On récupère le pseudo et on l'envoi au serveur
  getUsername(socket);

  /*************************************
  Chat textuel
  **************************************/

  // Quand un nouveau client se connecte
  socket.on('new_client', function(data) {
    if(data.pseudo == pseudo) {
      $('#username').append('<p><em><strong>Bienvenue, ' + data.pseudo + '</strong></em></p>');
    }

    // On met à jour la liste des joueurs connectés
    updateConnectedPlayers(data.listePseudos);

    // Le message de connexion est affiché au milieu
    $('#zone_chat').append('<p><em><strong>' + data.pseudo + '</strong> a rejoint le chat !</em></p>');

    // Dirige la barre de défilement au message le plus récent
    var chatZone = document.getElementById("zone_chat");
    chatZone.scrollTop = chatZone.scrollHeight;
  });

  // Quand un client se déconnecte
  socket.on('leaving_client', function(data) {
    // Le message de déconnexion est affiché au milieu
    $('#zone_chat').append('<p><em><strong>' + data.pseudo + '</strong> a quitté le chat...</em></p>');

    // Si le joueur qui vient de quitter était celui qui dessinait ou qui allait dessiner
    if(data.pseudo == nextDrawingUser) {
      // On réinitialize le compte à rebours
      $('#countdown').replaceWith('<section id="countdown"></section>');
    }

    // On met à jour la liste des joueurs connectés
    updateConnectedPlayers(data.listePseudos);

    // S'il n'y a plus personne sur la page
    if(data.listePseudos.elements.length == 0) {
      drawingUser = null;
      nextDrawingUser = null;
    }

    // Dirige la barre de défilement au message le plus récent
    var chatZone = document.getElementById("zone_chat");
    chatZone.scrollTop = chatZone.scrollHeight;
  });

  // Quand le mot a été trouvé
  socket.on('word_found', function(data) {
    // Le message est affiché au milieu
    $('#zone_chat').append('<font color="green"><p><em><strong>' + data.pseudo + '</strong> a trouvé le mot : <strong>' + data.word + '</strong></em></p></font>');
    // On réinitialize le compte à rebours
    $('#countdown').replaceWith('<section id="countdown"></section>');
  });

  // Quand le mot n'a pas été trouvé
  socket.on('word_not_found', function(word) {
    // Le message est affiché au milieu
    $('#zone_chat').append(`<font color="red"><p><em>Personne n'a trouvé le mot : <strong>` + word + '</strong></em></p></font>');
    // On réinitialize le compte à rebours
    $('#countdown').replaceWith('<section id="countdown"></section>');
  })

  // Quand on met-à-jour le compte à rebours visible à l'écran
  socket.on('update_countdown', function(timeLeft) {
    // Si on est en train de dessiner
    if(pseudo == drawingUser) {
      // On affiche le temps restant pour faire deviner le mot
      $('#countdown').replaceWith('<section id="countdown"><p><em>Il vous reste <strong>' + timeLeft + ' secondes pour faire deviner le mot</strong></em></section>');
    }
    // Sinon
    else {
      // On affiche le temps restant avant de trouver le mot
      $('#countdown').replaceWith('<section id="countdown"><p><em>Il vous reste <strong>' + timeLeft + ' secondes pour trouver le mot</strong></em></section>');
    }
  });

  // Quand on reçoit un message du serveur
  socket.on('chatMessage', function(data) {
    // Si nous avons envoyé le message
    if(data.pseudo == pseudo) {
      // Il est affiché à droite
      $('#zone_chat').append('<section id="zone_chat_right"><p><strong>' + data.pseudo + ' :</strong> ' + data.message + '</p></section>');
    }
    // Sinon
    else {
      // Il est affiché à gauche
      $('#zone_chat').append('<section id="zone_chat_left"><p><strong>' + data.pseudo + ' :</strong> ' + data.message + '</p></section>');
    }

    // Dirige la barre de défilement au message le plus récent
    var chatZone = document.getElementById("chat");
    chatZone.scrollTop = chatZone.scrollHeight;
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
    // Si on est autorisé à dessiner
    if(pseudo == drawingUser) {
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
    }
  })

  // On relâche avec la souris
  $("#whiteboard").mouseup(function(e){
    // Si on est autorisé à dessiner
    if(pseudo == drawingUser) {
      // On arrête de dessiner
      drawing = false;

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'mouseup', pseudo: pseudo});
    }
  })

  // On sort de la zone de dessin
  $("#whiteboard").mouseout(function(e){
    // Si on est autorisé à dessiner
    if(pseudo == drawingUser) {
      // On arrête de dessiner
      drawing = false;

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'mouseout', pseudo: pseudo});
    }
  })

  // On bouge la souris
  $("#whiteboard").mousemove(function(e){
    // Si on est autorisé à dessiner
    if(pseudo == drawingUser) {
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
    }
  })

  // Pour chaque boutons

  $("#eraseButton").click(function(){
    // Si on est autorisé à dessiner
    if(pseudo == drawingUser) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'erase', pseudo: pseudo});
    }
  })

  $("#thinButton").click(function(){
    // Si on est autorisé à dessiner
    if(pseudo == drawingUser) {
      context.beginPath();
      context.lineWidth = 1;

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'thin', pseudo: pseudo});
    }
  })


  $("#thickButton").click(function(){
    // Si on est autorisé à dessiner
    if(pseudo == drawingUser) {
      context.beginPath();
      context.lineWidth = 10;

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'thick', pseudo: pseudo});
    }
  })

  $("#blackButton").click(function(){
    // Si on est autorisé à dessiner
    if(pseudo == drawingUser) {
      context.beginPath();
      context.strokeStyle = "#000000";

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'black', pseudo: pseudo});
    }
  })


  $("#redButton").click(function(){
    // Si on est autorisé à dessiner
    if(pseudo == drawingUser) {
      context.beginPath();
      context.strokeStyle = "#CC0000";

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'red', pseudo: pseudo});
    }
  })


  $("#greenButton").click(function(){
    // Si on est autorisé à dessiner
    if(pseudo == drawingUser) {
      context.beginPath();
      context.strokeStyle = "#00CC00";

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'green', pseudo: pseudo});
    }
  })


  $("#blueButton").click(function(){
    // Si on est autorisé à dessiner
    if(pseudo == drawingUser) {
      context.beginPath();
      context.strokeStyle = "#0000CC";

      // On envoi un message au serveur
      socket.emit('drawingAction', {type: 'blue', pseudo: pseudo});
    }
  })

  /*************************************
  Pour les autres clients
  **************************************/

  // Quand on indique qui dessine
  socket.on('whos_drawing', function(data) {
    // On cache la boîte à outil
    document.getElementById("toolbox").style.display = 'none';

    // Si un utilisateur dessine ou va dessiner
    if(nextDrawingUser != null) {
      // On écrit sur la page qui dessine
      $('#drawingUser').replaceWith('<section id="drawingUser"><p><em><strong>' + data.drawingUser + ' est en train de dessiner...</strong></em></p></section>');
    }

    // Si aucun utilisateur ne dessine
    else {
      // Si on est l'hôte
      if(data.listePseudos.elements[0] == pseudo) {
        $('#drawingUser').replaceWith('<section id="drawingUser"></section>');
        document.getElementById("launchGame").style.display = 'block';
      }
      // Sinon
      else {
        // On écrit sur la page qui est l'hôte
        $('#drawingUser').replaceWith(`<section id="drawingUser"><p><em><strong>C'est à ` + data.listePseudos.elements[0] + ' de décider quand commencer la partie.</strong></em></p></section>');
      }
    }
  });

  $("#launchGame").click(function() {
    // On cache le bouton
    document.getElementById("launchGame").style.display = 'none';
    // On lance la partie
    socket.emit('launch_game');
  });

  // Quand on indique qui dessine
  socket.on('new_round', function(data) {
    // Largeur du trait par défaut
    context.lineWidth = 1;
    // Couleur par défaut
    context.strokeStyle = "#000000";

    // Booléen utilisé pour savoir si on est entrain de dessiner ou non
    drawing = false;
    drawingUser = null;

    drawingWords[0] = data.firstWord;
    drawingWords[1] = data.secondWord;
    drawingWords[2] = data.thirdWord;

    nextDrawingUser = data.username;

    // On met à jour la liste des joueurs connectés
    updateConnectedPlayers(data.listePseudos);

    // On efface la toile en début de manche
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Si on est l'utilisateur va dessiner
    if(pseudo == data.username) {

      // On affiche la boîte à outil
      document.getElementById("toolbox").style.display = 'block';

      // On affiche le choix de mots
      document.getElementById("wordsToChoose").style.display = 'block';

      // On affiche les mots dans le choix des mots
      $("#firstWord").replaceWith('<p id="firstWord">' + data.firstWord + '</p>');
      $("#secondWord").replaceWith('<p id="secondWord">' + data.secondWord + '</p>');
      $("#thirdWord").replaceWith('<p id="thirdWord">' + data.thirdWord + '</p>');

      // On lui indique qu'il doit choisir un mot
      context.font = "30px Arial";
      context.fillText("Vous devez choisir un mot à faire",25,125);
      context.fillText("deviner dans la liste ci-dessous.",35,175);
    }
    // Sinon
    else {
      // On cache la boîte à outil
      document.getElementById("toolbox").style.display = 'none';
      }

    // On l'écrit sur la page
    $('#drawingUser').replaceWith('<section id="drawingUser"><p><em><strong>' + data.username + ' est en train de dessiner...</strong></em></p></section>');
  });

  $("#firstWordButton").click(function() {
    // On cache le choix des mots
    document.getElementById("wordsToChoose").style.display = 'none';

    // On supprime l'indication
    context.clearRect(0, 0, canvas.width, canvas.height);

    // On identifie le nextDrawingUser comme le drawingUser (il est maintenant autorisé à dessiner)
    drawingUser = nextDrawingUser;

    // On rappelle le mot qu'il doit faire deviner
    $('#drawingUser').append('<p><em>Vous devez faire deviner le mot <strong>' + drawingWords[0] + '</strong></em></p>');

    // On indique au serveur que le premier mot de la liste a été choisit
    socket.emit('word', "first");
  });

  $("#secondWordButton").click(function(){
    // On cache le choix des mots
    document.getElementById("wordsToChoose").style.display = 'none';

    // On supprime l'indication
    context.clearRect(0, 0, canvas.width, canvas.height);

    // On identifie le nextDrawingUser comme le drawingUser (il est maintenant autorisé à dessiner)
    drawingUser = nextDrawingUser;

    // On rappelle le mot qu'il doit faire deviner
    $('#drawingUser').append('<p><em>Vous devez faire deviner le mot <strong>' + drawingWords[1] + '</strong></em></p>');

    // On indique au serveur que le deuxième mot de la liste a été choisit
    socket.emit('word', "second");
  });

  $("#thirdWordButton").click(function(){
    // On cache le choix des mots
    document.getElementById("wordsToChoose").style.display = 'none';

    // On supprime l'indication
    context.clearRect(0, 0, canvas.width, canvas.height);

    // On identifie le nextDrawingUser comme le drawingUser (il est maintenant autorisé à dessiner)
    drawingUser = nextDrawingUser;

    // On rappelle le mot qu'il doit faire deviner
    $('#drawingUser').append('<p><em>Vous devez faire deviner le mot <strong>' + drawingWords[2] + '</strong></em></p>');

    // On indique au serveur que le troisième mot de la liste a été choisit
    socket.emit('word', "third");
  });

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
