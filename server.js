//server.js

// Structure de queue utilisée pour la liste des pseudos.
class Queue {
  constructor(...elements) {
    this.elements = [...elements];
  }

  push(...args) {
    return this.elements.push(...args);
  }

  shift(...args) {
    return this.elements.shift(...args);
  }

  has(element) {
    // On parcours le tableau
    for(let i = 0; i < this.elements.length; i++) {
      // Si on trouve l'élément
      if(this.elements[i] == element) {
        // On renvoi son index
        return i;
      }
    }
    // Sinon, on renvoi -1
    return -1;
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

  removeFirstElement() {
    // On récupère la première valeur du tableau
    let returnValue = this.elements[0];
    // On parcours le tableau
    for(let i = 0; i < this.elements.length - 1; i++) {
      // On échange les valeurs afin d'avoir tous les éléments décalés d'une case vers la gauche
      this.elements[i] = this.elements[i + 1];
    }

    // On met à jour la longueur du tableau
    this.elements.length--;

    // On retourne la première valeur du tableau
    return returnValue;
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

// On travaille sur l'application
// the __dirname is the current directory from where the script is running
app.use(favicon(__dirname + '/build/favicon.ico'));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// On créer un serveur avec l'application
server.listen(port, () => console.log(`Listening on port ${port}.`));

// On créer la queue utilisé pour le stockage des pseudos
const listePseudos = new Queue();

// Pseudo du joueur qui dessine
var drawingUser = null;

// Différents choix de mots à dessiner
var drawingWords = [null, null, null];

// Le mot choisit par le dessinateur
var word;

// Le compte à rebours
var timeout;
var timeLeft;
var timeLeftCounter;

// L'ordre de passage en tant que dessinateur est une boucle
function newRound() {
  // On arrête le compte à rebours
  clearTimeout(timeout);
  clearInterval(timeLeftCounter);

  // On réinitialise le mot à trouver
  word = null;

  // On prend le premier pseudo de la liste
  drawingUser = listePseudos.removeFirstElement();
  // On le rajoute à la fin
  listePseudos.push(drawingUser);

  // On initialize les 3 choix possibles de mots à deviner
  drawingWords[0] = "word1";
  drawingWords[1] = "word2";
  drawingWords[2] = "word3";

  // On envoi au message au nouveau client pour lui indiquer qui dessine
  play.emit('new_round', {username: drawingUser, listePseudos: listePseudos, firstWord: drawingWords[0], secondWord: drawingWords[1], thirdWord: drawingWords[2]});
}

function countdown() {
  play.emit('word_not_found', word);
  newRound();
}

function displayCountdown() {
  play.emit('update_countdown', timeLeft);
  timeLeft--;
}

var play = io
  // On dédie un socket à la page play
  .of('/play')

  // Quand un client se connecte
  .on('connection', function (socket, pseudo) {
    // Si c'est un nouveau client
    socket.on('new_client', function(pseudo) {
      // Si le pseudo est déjà utilisé
      if(listePseudos.has(pseudo) != -1) {
        socket.emit('username_already_used');
      }

      // Sinon
      else {
        // On indique que le pseudo n'est pas déjà utilisé
        socket.emit('username_not_taken');
        // On encode le pseudo par sécurité
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        // On l'ajoute à la liste de pseudos
        listePseudos.push(pseudo);

        // On envoi au message au nouveau client pour lui indiquer qui dessine
        socket.emit('whos_drawing', {drawingUser: drawingUser, listePseudos: listePseudos});

        // On l'écrit dans le log
        console.log(`${pseudo} connecté !`);
        // On envoi un message à tous les clients connectés à la page
        play.emit('new_client', {pseudo: pseudo, listePseudos: listePseudos});
      }
    });

    // Quand on reçoit le mot choisit par le dessinateur
    socket.on('word', function(chosenWord) {
      switch(chosenWord) {
        case "first":
          word = drawingWords[0];
          break;
        case "second":
          word = drawingWords[1];
          break;
        case "third":
          word = drawingWords[2];
      }

      // On lance le compte à rebours de 60 secondes
      timeout = setTimeout(countdown, 61000);

      // On lance l'affichage du compte à rebours
      timeLeft = 60;
      timeLeftCounter = setInterval(displayCountdown, 1000);
    });

    // Quand l'hôte lance la partie
    socket.on('launch_game', function() {
      newRound();
    });

    // Quand on reçoit une action de dessin
    socket.on('drawingAction', function(data) {
      // On le retransmet aux autres clients connectés
      play.emit('drawingAction', data);
    });

    // Quand on reçoit un message du chat
    socket.on('chatMessage', function(message) {
      // Si le message n'est pas vide
      if(message != '') {
        // On le retransmet aux autres clients connectés
        play.emit('chatMessage', {pseudo: socket.pseudo, message: message});
      }

      // Si le message correspond au mot choisit par le dessinateur et que ce n'est pas le dessinateur qui l'a écrit
      if(message == word && drawingUser != socket.pseudo) {
        // On indique au chat que le mot a été trouvé
        play.emit('word_found', {word: word, pseudo: socket.pseudo})

        // On lance un nouveau round
        newRound();
      }
    });


    // Quand le client se déconnecte
    socket.on('disconnect', function() {
      // Si le pseudo est bien dans la liste, on le supprime
      if(listePseudos.remove(socket.pseudo) != -1) {
        // On l'écrit dans le log
        console.log(`${socket.pseudo} déconnecté...`);
        // On envoi un message à tous les clients connectés à la page
        play.emit('leaving_client', {pseudo: socket.pseudo, listePseudos: listePseudos});

        // S'il reste quelqu'un sur la page
        if(listePseudos.getLength() > 0) {
          // Si c'était l'utilisateur qui était en train de dessiner
          if(socket.pseudo == drawingUser) {
            newRound();
          }
          // Si personne ne dessinait et que c'était l'utilisteur qui devait lancer la partie
          if(drawingUser == null) {
            play.emit('whos_drawing', {drawingUser: drawingUser, listePseudos: listePseudos});
          }
        }
      }

      // S'il n'y a plus personne sur le page
      if(listePseudos.getLength() == 0) {
        drawingUser = null;
        // On arrête le compte à rebours
        clearTimeout(timeout);
        clearInterval(timeLeftCounter);
      }
    });
  });
