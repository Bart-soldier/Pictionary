// draw.js

var canvas;
var context;
var drawing = false;

$(document).ready(function(){
  canvas = document.getElementById("whiteboard");
  context = canvas.getContext("2d");
  // Largeur du trait par défaut
  context.lineWidth = 1;
  // Couleur par défaut
  context.strokeStyle = "#000000";

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
  })

  // On relâche avec la souris
  $("#whiteboard").mouseup(function(e){
    // On arrête de dessiner
    drawing = false;
  })

  // On sort de la zone de dessin
  $("#whiteboard").mouseout(function(e){
    // On arrête de dessiner
    drawing = false;
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
    }
  })

  // Pour chaque boutons

  $("#eraseButton").click(function(){
    context.clearRect(0, 0, canvas.width, canvas.height);
  })

  $("#thinButton").click(function(){
    context.beginPath();
    context.lineWidth = 1;
  })


  $("#thickButton").click(function(){
    context.beginPath();
    context.lineWidth = 10;
  })

  $("#blackButton").click(function(){
    context.beginPath();
    context.strokeStyle = "#000000";
  })


  $("#redButton").click(function(){
    context.beginPath();
    context.strokeStyle = "#CC0000";
  })


  $("#greenButton").click(function(){
    context.beginPath();
    context.strokeStyle = "#00CC00";
  })


  $("#blueButton").click(function(){
    context.beginPath();
    context.strokeStyle = "#0000CC";
  })
})
