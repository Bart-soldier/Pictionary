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

    return index;
  }

  get firstElement() {
    // On récupère la première valeur du tableau
    returnValue = this.elements[0];
    // On parcours le tableau
    for(let i = 0; i < this.elements.length - 1; i++) {
      // On échange les valeurs afin d'avoir tous les éléments décalés d'une case vers la gauche
      this.elements[i] = this.elements[i + 1];
    }

    // On retourne la première valeur du tableau
    return returnValue;
  }

  get length() {
    return this.elements.length;
  }

  set length(length) {
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
        // On l'écrit dans le log
        console.log(`${pseudo} connecté !`);
        // On envoi un message à tous les clients connectés à la page
        play.emit('new_client', pseudo);
      }
    });

    // Quand on reçoit une action de dessin
    socket.on('drawingAction', function(message) {
      // On le retransmet aux autres clients connectés
      play.emit('drawingAction', message);
    });

    // Quand on reçoit un message du chat
    socket.on('chatMessage', function(message) {
      // On le retransmet aux autres clients connectés
      play.emit('chatMessage', {pseudo: socket.pseudo, message: message});
    });


    // Quand le client se déconnecte
    socket.on('disconnect', function() {
      // Si le pseudo est bien dans la liste, on le supprime
      if(listePseudos.remove(socket.pseudo) != -1) {
        // On l'écrit dans le log
        console.log(`${socket.pseudo} déconnecté !`);
        // On envoi un message à tous les clients connectés à la page
        play.emit('leaving_client', socket.pseudo);
      }
    });
  });

/*
io.on('connection', function (socket) {
  console.log('Un client est connecté !');
  socket.emit('message', 'Vous êtes bien connecté !');
});

// Quand le serveur reçoit un message
io.on('message', function (message) {
  console.log('CHECK : ' + message);
})*/

/*
let server = http.createServer((req, res) => {
  console.log(req.url);
  let url = url_parser.parse(req.url, true);

  if(url.pathname == '/') {
    //res.writeHead(200, {'content-type': 'text/html'});
    //res.end(`salut <span style="color:red">toi</span>`);
    let path = "./public/index.html";
    if(fs.existsSync(path)) {
      let contents = fs.readFileSync(path);
    }
    else {
      // pas trouvé
    }
  }

  else {
    res.writeHead(404);res.end("not found");
  }
});

server.listen(port, () => console.log(`http server on port ${port}!`));*/
