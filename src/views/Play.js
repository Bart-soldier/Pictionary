import React from 'react';

const Play = () => {
    return (
      <div className="Play">
        <div className="jumbotron text-center">
          <div className="container">
            <h1>Projet Application Web</h1>
            <p>Play</p>
          </div>
        </div>

        <div className="container">
          <center>
            <div id="conteneur">
              <canvas id="whiteboard" width="500" height="300">
                Your browser needs to support canvas in order to be able to play !
              </canvas>

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

        <div className="w3-container w3-black w3-center w3-opacity w3-padding-64">
            <h1 className="w3-margin w3-xlarge">Team members :</h1>
            <h1 className="w3-margin w3-xlarge">CLERC Billy & de JAHAM Charles</h1>
        </div>

        <footer className="w3-container w3-padding-64 w3-center w3-opacity">
          <p>Original website template provided by <a href="https://www.heroku.com/" target="_blank">Heroku</a> and <a href="https://www.w3schools.com/" target="_blank">w3schools.com</a></p>
        </footer>
      </div>
    );
}

export default Play;
