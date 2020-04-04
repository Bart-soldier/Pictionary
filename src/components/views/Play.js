import React from 'react';
//import '../stylesheets/default.css';
//import '../scripts/draw.js';
//import '../../../node_modules/jquery/dist/jquery.min.js';

const Play = () => {
    return (
      <div className="Play">
        <center>
          <div id="conteneur">
            <canvas id="whiteboard" width="500" height="300"></canvas>
            <br/>
            <button id="eraseButton">Tout effacer</button>
            <br/><br/>
            Largeur du trait :
            <button id="thinButton">Fin</button>
            <button id="thickButton">Épais</button>
            <br/><br/>
            Couleur du trait :
            <button id="blackButton">Noir</button>
            <button id="redButton">Rouge</button>
            <button id="greenButton">Vert</button>
            <button id="blueButton">Bleu</button>
          </div>
        </center>

        <br/>
      </div>
    );
}

export default Play;
