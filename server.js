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

// Nombre de client connectés
var clientNb = 0;

// On dédie un socket à la page play
var play = io
  .of('/play')

  // Quand un client se connecte
  .on('connection', function (socket) {
    clientNb++;
    console.log('Client connecté !');
    // On envoi un message au client
    socket.emit('check', {message: 'Tu es bien connecté !', clientNb: clientNb});
    // On envoi un message à tous les clients connecté à la page
    play.emit('checkAll', 'Un nouveau client est connecté');

    // Quand le client envoie une action de dessin
    socket.on('drawingAction', function(message) {
      // On le retransmet aux autres clients connectés
      play.emit('drawingAction', message);
    })
  })

  .on('disconnect', function() {
    console.log('Client déconnecté !');
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
