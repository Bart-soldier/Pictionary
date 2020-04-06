//server.js

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

var play = io
  // On dédie un socket à la page play
  .of('/play')

  // Quand un client se connecte
  .on('connection', function (socket, pseudo) {
    // Si c'est un nouveau client
    socket.on('new_client', function(pseudo) {
      pseudo = ent.encode(pseudo);
      socket.pseudo = pseudo;
      // On l'écrit dans le log
      console.log(`${pseudo} connecté !`);
      // On envoi un message à tous les clients connectés à la page
      play.emit('new_client', pseudo);
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
      // On l'écrit dans le log
      console.log(`${socket.pseudo} déconnecté !`);
      // On envoi un message à tous les clients connectés à la page
      play.emit('leaving_client', socket.pseudo);
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
