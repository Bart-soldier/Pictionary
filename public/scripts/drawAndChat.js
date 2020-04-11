/***************************************
* CLERC Billy & de JAHAM Charles
*
* drawAndChat.js
***************************************/

/***************************************
* Déclaration de variables globales
***************************************/
// La toile sur laquelle nous allons travailler
var canvas;
// Son contexte graphique
var context;
// Un booléen pour savoir si on est actuellement en train de dessiner
var drawing;
// Notre nom d'utilisateur
var myUsername;
// drawingUser indique l'utilisateur qui est actuellement en train de dessiner
// Ce dernier à accès à la toile de dessin et à la boîte à outil
var drawingUser;
// nextDrawingUser indique l'utilisateur qui s'apprête à dessiner
// mais qui est actuellement en train de choisir son mot à faire deviner
// Ce dernier n'a pas accès à la toile de dessin
var nextDrawingUser;
// La liste des choix de mots à deviner
var wordsToGuess;

// URL locale du serveur
//const url = 'http://localhost:8080/play';
// URL Heroku du serveur
const url = 'https://clerc-dejaham-pictionary.herokuapp.com/play';

/***************************************
* Déclaration de fonctions
***************************************/

// Fonction asynchrone qui se charge de demander à l'utilisateur un nom d'utilisateur
// jusqu'à ce que ce dernier soit unique et non nul
async function getUsername(socket) {
  // On récupère le nom d'utilisateur
  myUsername = prompt("Quel est votre nom d'utilisateur ?").trim();
  // On déclare le booléen utilisé pour savoir si le nom d'utilisateur est accepté
  let isUsernameAlreadyUsed = true;

  // Tant que l'utilisateur n'a pas entré de nom d'utilisateur correspondant aux critères demandés
  while(isUsernameAlreadyUsed) {
    // Tant que l'utilisateur n'a pas entré de nom d'utilisateur non nul
    while(myUsername == null || myUsername == '') {
      myUsername = prompt("Vous devez entrer un nom d'utilisateur.\nQuel est votre nom d'utilisateur ?").trim();
    }

    // On attend la promesse pour savoir si le nom d'utilisateur est déjà utilisé
    isUsernameAlreadyUsed = await isUsernameTaken(socket);

    // Si le nom d'utilisateur est déjà utilisé
    if(isUsernameAlreadyUsed) {
      myUsername = prompt(`Le nom d'utilisateur ${myUsername} est déjà utilisé. Merci d'en choisir un autre.\nQuel est votre nom d'utilisateur ?`).trim();
    }
  }
}

// Fonction qui renvoie une promesse
// Cette dernière indique si le nom d'utilisateur est déjà utilisé ou non en fonction de la réponse du seveur
// Sinon, si aucun message n'est reçu dans les 2 secondes, elle indique par défaut que le nom d'utilisateur est déjà pris
function isUsernameTaken(socket) {
  // On envoi le nom d'utilisateur au serveur
  socket.emit('new_client', myUsername);

  return new Promise(resolve => {
    // Si on sait que le nom d'utilisateur est déjà utilisé, on renvoi la promesse avec la valeur vrai
    socket.on('username_already_used', function() {
      resolve(true);
    });
    // Si on sait que le nom d'utilisateur n'est pas déjà utilisé, on renvoi la promesse avec la valeur faux
    socket.on('username_not_taken', function() {
      resolve(false);
    });
    // Si le temps s'écoule, on renvoi la promesse avec la valeur vrai
    setTimeout(() => {
      resolve(true);
    }, 2000);
  });
}

// Fonction qui met à jour l'affichage à l'écran de la listes de joueurs connectés dans l'ordre de passage en tant que dessinateur
function updateConnectedPlayers(usernameList) {
  // On réinitialise la liste des joueurs connectés
  $('#connectedPlayers').replaceWith('<section id="connectedPlayers"></section>');

  // On parcourt tous les nom d'utilisateur
  for(let i = 0; i < usernameList.elements.length; i++) {
    // On ajoute le nom d'utilisateur à la liste des joueurs connectés
    $('#connectedPlayers').append('<p><em><strong>' + usernameList.elements[i][0] + '</strong></em></p>');
    // On ajoute le score à la liste des joueurs connectés
    $('#connectedPlayers').append('<p><em><strong>Score : ' + usernameList.elements[i][1] + '</strong></em></p><hr/>');
  }
}

// Fonction executée quand le dessinateur choisit le mot qu'il va faire deviner
function chooseWord(socket, chosenWord) {
  // On cache le choix des mots
  document.getElementById("wordsToChoose").style.display = 'none';

  // On supprime l'indication
  context.clearRect(0, 0, canvas.width, canvas.height);

  // On identifie le nextDrawingUser comme le drawingUser (il est maintenant autorisé à dessiner)
  drawingUser = nextDrawingUser;

  // On écrit sur la page que l'on peut dessiner
  $('#drawingUser').replaceWith('<section id="drawingUser"><p><em><strong>Vous êtes en train de dessiner...</strong></em></p></section>');

  // On rappelle le mot qu'il doit faire deviner
  $('#drawingUser').append('<p><em>Vous devez faire deviner le mot <strong>' + chosenWord + '</strong></em></p>');

  // On indique au serveur quel mot de la liste a été choisit
  socket.emit('wordToGuess', chosenWord);
}

/***************************************
* Script
***************************************/

$(document).ready(function(){
  // Initialisation des variables
  canvas = document.getElementById("whiteboard");
  context = canvas.getContext("2d");
  drawing = false;
  myUsername = null;
  drawingUser = null;
  nextDrawingUser = null;
  wordsToGuess = [null, null, null];

  // Connexion socket.io
  const socket = io.connect(url);

  // On récupère le nom d'utilisateur et on l'envoi au serveur
  getUsername(socket);

  /***************************************
  * Messages dans le chat textuel
  ***************************************/

  // Quand un nouveau client se connecte
  socket.on('connected_client', function(data) {
    // Si nous sommes ce client
    if(data.username == myUsername) {
      // On l'affiche au dessus du chat notre nom d'utilisateur
      $('#username').append('<p><em><strong>Bienvenue, ' + myUsername + '</strong></em></p>');
    }

    // On met à jour la liste des joueurs connectés
    updateConnectedPlayers(data.usernameList);

    // On indique à tout le monde dans le chat qu'un nouveau client vient de se connecter
    $('#zone_chat').append('<p><em><strong>' + data.username + '</strong> a rejoint le chat !</em></p>');

    // Déplace la barre de défilement du chat au message le plus récent (le plus bas)
    let scrollBar = document.getElementById("chat");
    scrollBar.scrollTop = scrollBar.scrollHeight;
  });

  // Quand un client se déconnecte
  socket.on('disconnected_client', function(data) {
    // Si le joueur qui vient de se déconnecter était celui qui dessinait ou qui allait dessiner
    if(data.username == nextDrawingUser) {
      // On réinitialize le compte à rebours
      $('#countdown').replaceWith('<section id="countdown"></section>');
    }

    // On met à jour la liste des joueurs connectés
    updateConnectedPlayers(data.usernameList);

    // On indique à tout le monde dans le chat qu'un client vient de se déconnecter
    $('#zone_chat').append('<p><em><strong>' + data.username + '</strong> a quitté le chat...</em></p>');

    // Déplace la barre de défilement du chat au message le plus récent (le plus bas)
    let scrollBar = document.getElementById("chat");
    scrollBar.scrollTop = scrollBar.scrollHeight;
  });

  // Quand on reçoit un message pour le chat
  socket.on('chat_message', function(data) {
    // Si nous avons envoyé le message
    if(data.username == myUsername) {
      // Il est affiché à droite
      $('#zone_chat').append('<section id="zone_chat_right"><p><strong>' + myUsername + ' :</strong> ' + data.message + '</p></section>');
    }
    // Sinon
    else {
      // Il est affiché à gauche
      $('#zone_chat').append('<section id="zone_chat_left"><p><strong>' + data.username + ' :</strong> ' + data.message + '</p></section>');
    }

    // Déplace la barre de défilement du chat au message le plus récent (le plus bas)
    let scrollBar = document.getElementById("chat");
    scrollBar.scrollTop = scrollBar.scrollHeight;
  });

  // Quand on envoie un message
  $('#formulaire_chat').submit(function () {
    // On récupère le message
    var message = $('#message').val();
    // On envoie le message au serveur
    socket.emit('chat_message', message);
    // Vide la zone d'entrée du message et on remet le focus dessus
    $('#message').val('').focus();
    // Permet de bloquer l'envoi "classique" du formulaire
    return false;
  });

  /***************************************
  * Interactions serveur liés au mot à deviner
  ***************************************/

  // Quand le mot a été trouvé
  socket.on('word_found', function(data) {
    // Le message est affiché au milieu
    $('#zone_chat').append('<font color="green"><p><em><strong>' + data.username + '</strong> a trouvé le mot : <strong>' + data.chosenWord + '</strong></em></p></font>');
    // On réinitialize le compte à rebours
    $('#countdown').replaceWith('<section id="countdown"></section>');
  });

  // Quand le mot n'a pas été trouvé
  socket.on('word_not_found', function(chosenWord) {
    // Le message est affiché au milieu
    $('#zone_chat').append(`<font color="red"><p><em>Personne n'a trouvé le mot : <strong>` + chosenWord + '</strong></em></p></font>');
    // On réinitialize le compte à rebours
    $('#countdown').replaceWith('<section id="countdown"></section>');
  })

  // Quand on met-à-jour le compte à rebours visible à l'écran
  socket.on('update_countdown', function(timeLeft) {
    // Si on est en train de dessiner
    if(myUsername == drawingUser) {
      // On affiche le temps restant pour faire deviner le mot
      $('#countdown').replaceWith('<section id="countdown"><p><em>Il vous reste <strong>' + timeLeft + ' secondes pour faire deviner le mot</strong></em></section>');
    }
    // Sinon
    else {
      // On affiche le temps restant pour trouver le mot
      $('#countdown').replaceWith('<section id="countdown"><p><em>Il vous reste <strong>' + timeLeft + ' secondes pour trouver le mot</strong></em></section>');
    }
  });

  /***************************************
  * Interactions serveur liés au lancement de la partie
  ***************************************/

  // Quand on indique qui dessine
  socket.on('whos_drawing', function(data) {
    // On cache la boîte à outil
    document.getElementById("toolbox").style.display = 'none';

    // Si un utilisateur a été choisit pour dessiner
    if(data.drawingUser != null) {
      // Si c'est nous
      if(data.drawingUser == myUsername) {
        // On l'écrit sur la page
        $('#drawingUser').replaceWith('<section id="drawingUser"><p><em><strong>Vous êtes en train de dessiner...</strong></em></p></section>');

      }
      else {
        // On écrit sur la page qui est cet utilisateur
        $('#drawingUser').replaceWith('<section id="drawingUser"><p><em><strong>' + data.drawingUser + ' est en train de dessiner...</strong></em></p></section>');
      }
    }

    // Si aucun utilisateur ne dessine
    else {
      // Si on est l'hôte (c'est-à-dire le premier utilisateur de la liste des noms d'utilisateur)
      if(data.usernameList.elements[0][0] == myUsername) {
        // On affiche le boutton pour lancer la partie
        $('#drawingUser').replaceWith('<section id="drawingUser"></section>');
        document.getElementById("launchGame").style.display = 'block';
        // On indique à l'hôte le nombre de joueurs minimum
        $('#drawingUser').replaceWith(`<section id="drawingUser"><p><em><strong>Il faut au moins deux joueurs pour pouvoir jouer</strong></em></p></section>`);
      }
      // Sinon
      else {
        // On indique aux autres joueurs qui est l'hôte
        $('#drawingUser').replaceWith(`<section id="drawingUser"><p><em><strong>C'est à ` + data.usernameList.elements[0][0] + ' de décider quand commencer la partie</strong></em></p></section>');
      }
    }
  });

  // Quand on clique sur le boutton pour lancer la partie
  $("#launchGame").click(function() {
    // On cache le bouton
    document.getElementById("launchGame").style.display = 'none';
    // On lance la partie
    socket.emit('launch_game');
  });

  // Quand on nous indique qu'il n'y a pas assez de joueurs pour lancer la partie
  socket.on('not_enough_players', function(usernameList) {
    // On indique à l'hôte qu'il n'y a pas assez de joueurs
    $('#drawingUser').replaceWith(`<section id="drawingUser"><p><em><strong>Il faut au moins deux joueurs pour pouvoir jouer</strong></em></p></section>`);

    // On réinitialize le compte à rebours
    $('#countdown').replaceWith('<section id="countdown"></section>');

    // On cache le choix des mots
    document.getElementById("wordsToChoose").style.display = 'none';

    // On cache la boîte à outil
    document.getElementById("toolbox").style.display = 'none';

    // On supprime l'indication
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Si on est l'hôte
    if(myUsername == usernameList.elements[0][0]) {
      // On remet le bouton pour lancer la partie
      document.getElementById("launchGame").style.display = 'block';
    }
    // Sinon
    else {
      // On indique aux autres joueurs qui est l'hôte
      $('#drawingUser').replaceWith(`<section id="drawingUser"><p><em><strong>C'est à ` + data.usernameList.elements[0][0] + ' de décider quand commencer la partie</strong></em></p></section>');
    }
  });

  /***************************************
  * Nouvelle manche et choix du mot à deviner
  ***************************************/

  // Quand on commence une nouvelle manche
  socket.on('new_round', function(data) {
    // Largeur du trait par défaut
    context.lineWidth = 1;
    // Couleur par défaut
    context.strokeStyle = "#000000";

    // On efface la toile de dessin en début de manche
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Réinitialisation des variables
    drawing = false;
    drawingUser = null;

    wordsToGuess[0] = data.firstWord;
    wordsToGuess[1] = data.secondWord;
    wordsToGuess[2] = data.thirdWord;

    nextDrawingUser = data.drawingUser;

    // On met à jour la liste des joueurs connectés
    updateConnectedPlayers(data.usernameList);

    // Si on est l'utilisateur qui va dessiner
    if(myUsername == nextDrawingUser) {
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

    // Pour les autres joueurs
    else {
      // On cache la boîte à outil
      document.getElementById("toolbox").style.display = 'none';
    }

    // Si on doit choisir un mot
    if(nextDrawingUser == myUsername) {
      // On l'écrit sur la page
      $('#drawingUser').replaceWith('<section id="drawingUser"><p><em><strong>Vous devez choisir un mot...</strong></em></p></section>');
    }
    else {
      // On indique aux autres qui va dessiner
      $('#drawingUser').replaceWith('<section id="drawingUser"><p><em><strong>' + data.drawingUser + ' est en train de dessiner...</strong></em></p></section>');
    }
  });

  $("#firstWordButton").click(function() {
    chooseWord(socket, wordsToGuess[0]);
  });

  $("#secondWordButton").click(function(){
    chooseWord(socket, wordsToGuess[1]);
  });

  $("#thirdWordButton").click(function(){
    chooseWord(socket, wordsToGuess[2]);
  });

  /***************************************
  * La boîte à outil du peintre
  ***************************************/

  // Quand on clic avec la souris
  $("#whiteboard").mousedown(function(e){
    // Si on est autorisé à dessiner
    if(myUsername == drawingUser) {
      // On indique qu'on dessine
      drawing = true;
      // Commence un nouveau chemin (avec la couleur et la largeur actuelle)
      context.beginPath();

      // Début du chemin au point actuel
      let x = e.pageX - canvas.offsetLeft;
      let y = e.pageY - canvas.offsetTop;
      context.moveTo(x,y);

      // On envoi un message au serveur
      socket.emit('drawing_action', {type: 'mousedown', x: x, y: y});
    }
  })

  // Quand on relâche avec la souris
  $("#whiteboard").mouseup(function(e){
    // Si on est autorisé à dessiner
    if(myUsername == drawingUser) {
      // On inque qu'on arrête de dessiner
      drawing = false;
    }
  })

  // Quand on sort de la zone de dessin
  $("#whiteboard").mouseout(function(e){
    // Si on est autorisé à dessiner
    if(myUsername == drawingUser) {
      // On inque qu'on arrête de dessiner
      drawing = false;
    }
  })

  // Quand on bouge la souris
  $("#whiteboard").mousemove(function(e){
    // Si on est autorisé à dessiner
    if(myUsername == drawingUser) {
      // Si on est entrain de dessiner
      if (drawing) {
        // On récupère la position actuelle
        let x = e.pageX - canvas.offsetLeft;
        let y = e.pageY - canvas.offsetTop;

        // On dessine une ligne entre les dernières coordonnées retenues et la position actuelle
        context.lineTo(x, y);
        context.stroke();

        // On envoi un message au serveur
        socket.emit('drawing_action', {type: 'mousemove', x: x, y: y});
      }
    }
  })

  // Quand on clic sur le boutton pour tout effacer
  $("#eraseButton").click(function(){
    // Si on est autorisé à dessiner
    if(myUsername == drawingUser) {
      // On efface toute la toile de dessin
      context.clearRect(0, 0, canvas.width, canvas.height);

      // On envoi un message au serveur
      socket.emit('drawing_action', {type: 'erase'});
    }
  })

  // Quand on clic sur le button pour avoir un trait fin
  $("#thinButton").click(function(){
    // Si on est autorisé à dessiner
    if(myUsername == drawingUser) {
      // On met à jour les propriétés du crayon
      context.beginPath();
      context.lineWidth = 1;

      // On envoi un message au serveur
      socket.emit('drawing_action', {type: 'thin'});
    }
  })

  // Quand on clic sur le button pour avoir un trait épas
  $("#thickButton").click(function(){
    // Si on est autorisé à dessiner
    if(myUsername == drawingUser) {
      // On met à jour les propriétés du crayon
      context.beginPath();
      context.lineWidth = 10;

      // On envoi un message au serveur
      socket.emit('drawing_action', {type: 'thick'});
    }
  })

  // Quand on clic sur le button pour avoir un trait noir
  $("#blackButton").click(function(){
    // Si on est autorisé à dessiner
    if(myUsername == drawingUser) {
      // On met à jour les propriétés du crayon
      context.beginPath();
      context.strokeStyle = "#000000";

      // On envoi un message au serveur
      socket.emit('drawing_action', {type: 'black'});
    }
  })

  // Quand on clic sur le button pour avoir un trait rouge
  $("#redButton").click(function(){
    // Si on est autorisé à dessiner
    if(myUsername == drawingUser) {
      // On met à jour les propriétés du crayon
      context.beginPath();
      context.strokeStyle = "#CC0000";

      // On envoi un message au serveur
      socket.emit('drawing_action', {type: 'red'});
    }
  })

  // Quand on clic sur le button pour avoir un trait vert
  $("#greenButton").click(function(){
    // Si on est autorisé à dessiner
    if(myUsername == drawingUser) {
      // On met à jour les propriétés du crayon
      context.beginPath();
      context.strokeStyle = "#00CC00";

      // On envoi un message au serveur
      socket.emit('drawing_action', {type: 'green'});
    }
  })

  // Quand on clic sur le button pour avoir un trait bleu
  $("#blueButton").click(function(){
    // Si on est autorisé à dessiner
    if(myUsername == drawingUser) {
      // On met à jour les propriétés du crayon
      context.beginPath();
      context.strokeStyle = "#0000CC";

      // On envoi un message au serveur
      socket.emit('drawing_action', {type: 'blue'});
    }
  })

  /***************************************
  * Actions de dessin reçues
  ***************************************/

  // Quand on reçoit une action liée au dessin
  socket.on('drawing_action', function(data) {
    // Si on est pas l'utilisateur qui dessine
    if(myUsername != drawingUser) {
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
          // On efface toute la toile de dessin
          context.clearRect(0, 0, canvas.width, canvas.height);
          break;

        case 'thin':
          // On met à jour les propriétés du crayon
          context.beginPath();
          context.lineWidth = 1;
          break;

        case 'thick':
          // On met à jour les propriétés du crayon
          context.beginPath();
          context.lineWidth = 10;
          break;

        case 'black':
          // On met à jour les propriétés du crayon
          context.beginPath();
          context.strokeStyle = "#000000";
          break;

        case 'red':
          // On met à jour les propriétés du crayon
          context.beginPath();
          context.strokeStyle = "#CC0000";
          break;

        case 'green':
          // On met à jour les propriétés du crayon
          context.beginPath();
          context.strokeStyle = "#00CC00";
          break;

        case 'blue':
          // On met à jour les propriétés du crayon
          context.beginPath();
          context.strokeStyle = "#0000CC";
      }
    }
  });
});
