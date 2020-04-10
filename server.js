/***************************************
* CLERC Billy & de JAHAM Charles
*
* server.js
***************************************/

// Structure de liste en queue utilisée pour la liste de nom d'utilisateurs
// Chaque élément de la liste a un nom d'utilisateur ([0]) et un score ([1])
class Queue {
  constructor(...elements) {
    this.elements = [...elements];
  }

  push(username, score) {
    let element = [username, score];
    return this.elements.push(element);
  }

  shift() {
    return this.elements.shift();
  }

  pop() {
    return this.elements.pop();
  }

  remove(element) {
    // On récupère l'index de l'élément
    let index = this.has(element);

    // Si l'élément n'est pas dans la liste
    if(index == -1) {
      // On renvoi -1
      return -1;
    }

    // Sinon on décale tous les éléments suivant l'index d'une case vers la gauche
    for(let i = index; i < this.elements.length - 1; i++) {
      this.elements[i] = this.elements[i + 1];
    }

    // On supprime le dernier élément de la liste
    this.elements.pop();

    return index;
  }

  has(username) {
    // On parcours le tableau
    for(let index = 0; index < this.elements.length; index++) {
      // Si on trouve le nom d'utilisateur
      if(this.elements[index][0] == username) {
        // On renvoi son index
        return index;
      }
    }

    // Sinon, on renvoi -1
    return -1;
  }

  incrementScore(username) {
    // On parcours le tableau
    for(let index = 0; index < this.elements.length; index++) {
      // Si on trouve le nom d'utilisateur
      if(this.elements[index][0] == username) {
        // On ajoute un point à son score
        this.elements[index][1]++;

        // On renvoi son index
        return index;
      }
    }

    // Sinon, on renvoi -1
    return -1;
  }

  get(index) {
    return this.elements[index];
  }

  getLength() {
    return this.elements.length;
  }

  setLength(length) {
    return this.elements.length = length;
  }
}

const express = require('express');
const favicon = require('express-favicon');
const path = require('path');
const http = require('http');
const url_parser = require('url');
let fs = require('fs');
const port = process.env.PORT || 8080;
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);
// Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const ent = require('ent');

// Travail sur l'application
// Le __dirname est le dossier depuis lequel le script est executé
app.use(favicon(__dirname + '/build/favicon.ico'));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// On créer un serveur avec l'application
server.listen(port, () => console.log(`Listening on port ${port}.`));

/***************************************
* Déclaration de variables globales
***************************************/

// La queue utilisée pour le stockage des noms d'utilistaur
const usernameList = new Queue();
// Le nom d'utilisateur du joueur qui est choisit pour dessiner
var drawingUser = null;
// La liste des choix de mots à deviner
var wordsToGuess = [null, null, null];
// Le mot choisit par le dessinateur
var word = null;
// Les variables liés au compte à rebours
var timeout; // Pour le timeout
var timeLeft; // L'indicateur de temps restant sur l'interval
var timeLeftCounter; // Pour l'interval

/***************************************
* Déclaration de fonctions
***************************************/

// Fonction qui initialise une nouvelle manche
// L'ordre de passage en tant que dessinateur est une boucle FIFO
function newRound() {
  // On arrête le compte à rebours
  clearTimeout(timeout);
  clearInterval(timeLeftCounter);

  // Réinitialisation des variables
  word = null;

  // On récupère le premier élément de la liste de nom d'utilisateur
  let element = usernameList.shift();

  // Le dessinateur de cette manche est le premier nom d'utilisateur de la liste
  drawingUser = element[0];
  // On le rajoute à la fin (boucle FIFO)
  usernameList.push(element[0], element[1]);


  // On initialize les 3 choix possibles de mots à deviner
  wordsToGuess[0] = "word1";
  wordsToGuess[1] = "word2";
  wordsToGuess[2] = "word3";

  // On envoi au message à tous les joueurs connectés pour lancer une nouvelle manche
  play.emit('new_round', {drawingUser: drawingUser, usernameList: usernameList, firstWord: wordsToGuess[0], secondWord: wordsToGuess[1], thirdWord: wordsToGuess[2]});
}

// Fonction qui sera executé à la fin du compte à rebours
// Cette dernière indique aux joueurs que le mot n'a pas été trouvé et lance une nouvelle manche
function countdown() {
  play.emit('word_not_found', word);
  newRound();
}

// Fonction qui sera executé par l'intervalle du compte à rebours (une seconde)
// Cette dernière affiche le temps restant au compte à rebours
function displayCountdown() {
  play.emit('update_countdown', timeLeft);
  timeLeft--;
}

/***************************************
* Interaction client - serveur
***************************************/

// play permet d'envoyer un message à tous les joueurs connectés à la page de jeu
var play = io
  // On dédie un socket à la page play
  .of('/play')

  // Quand un client se connecte
  .on('connection', function (socket, username) {

    // Quand c'est un nouveau client
    socket.on('new_client', function(username) {
      // Si le nom d'utilisateur est déjà utilisé
      if(usernameList.has(username) != -1) {
        // On l'indique au client
        socket.emit('username_already_used');
      }

      // Si le nom d'utilisateur n'est pas déjà utilisé
      else {
        // On indique que le nom d'utilisateur est libre
        socket.emit('username_not_taken');
        // On encode le nom d'utilisateur par sécurité
        username = ent.encode(username);
        socket.username = username;
        // On l'ajoute à la liste de nom d'utilisateur et un score de 0
        usernameList.push(username, 0);

        // On envoi au message au nouveau client pour lui indiquer qui dessine
        socket.emit('whos_drawing', {drawingUser: drawingUser, usernameList: usernameList});

        // On l'écrit dans le log
        console.log(`${username} connecté !`);
        // On envoi un message à tous les clients connectés
        play.emit('connected_client', {username: username, usernameList: usernameList});
      }
    });

    // Quand l'hôte lance la partie
    socket.on('launch_game', function() {
      // S'il y a au moins deux joueurs
      if(usernameList.getLength() > 1) {
        // On commence une nouvelle manche
        newRound();
      }
      // Sinon
      else {
        // On indique qu'il n'y a pas assez de joueurs à l'hôte de la partie
        socket.emit('not_enough_players', usernameList);
      }
    });

    // Quand on reçoit le mot choisit par le dessinateur
    socket.on('wordToGuess', function(chosenWord) {
      // On sauvegarde le mot choisit
      word = chosenWord;

      // On lance le compte à rebours de 60 secondes (61 secondes pour être identique à l'intervalle)
      timeout = setTimeout(countdown, 61000);

      // On lance l'affichage du compte à rebours
      timeLeft = 60;
      timeLeftCounter = setInterval(displayCountdown, 1000);
    });

    // Quand on reçoit une action de dessin
    socket.on('drawing_action', function(data) {
      // On la retransmet à tous les clients connectés
      play.emit('drawing_action', data);
    });

    // Quand on reçoit un message du chat
    socket.on('chat_message', function(message) {
      // Si le message n'est pas vide
      if(message != '') {
        // On le retransmet à tous les clients connectés
        play.emit('chat_message', {username: socket.username, message: message});
      }

      // Si le message correspond au mot choisit par le dessinateur et que ce n'est pas le dessinateur qui l'a écrit
      if(message == word && drawingUser != socket.username) {
        // On donne un point à celui qui a trouvé le mot
        usernameList.incrementScore(socket.username);
        // On indique au chat que le mot a été trouvé
        play.emit('word_found', {chosenWord: word, username: socket.username})

        // On lance une nouvelle manche
        newRound();
      }
    });


    // Quand le client se déconnecte
    socket.on('disconnect', function() {
      // Si le nom d'utilisateur est bien dans la liste, on le supprime
      // (pour éviter d'afficher le cas où un client rejoint la partie et quitte avant d'entrer son nom d'utilisateur)
      if(usernameList.remove(socket.username) != -1) {
        // On l'écrit dans le log
        console.log(`${socket.username} déconnecté...`);
        // On envoi un message à tous les clients connectés à la page
        play.emit('disconnected_client', {username: socket.username, usernameList: usernameList});

        // S'il y a assez de joueurs pour pouvoir jouer
        if(usernameList.getLength() > 1) {
          // On regarde si le client était l'utilisateur qui était en train de dessiner
          if(socket.username == drawingUser) {
            // On lanche une nouvelle manche
            newRound();
          }
          // Si personne ne dessinait
          if(drawingUser == null) {
            play.emit('whos_drawing', {drawingUser: drawingUser, usernameList: usernameList});
          }
        }

        // S'il n'y a plus assez de joueurs pour pouvoir jouer
        else {
          // On réinitialise les variables
          drawingUser = null;
          var word = null;

          // On arrête le compte à rebours
          clearTimeout(timeout);
          clearInterval(timeLeftCounter);

          // On indique le nouvel hôte
          play.emit('not_enough_players', usernameList);
        }
      }
    });
  });
