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
            <div class ="row">
              <div class="column left">
                <section id="connectedPlayersHeader">
                  <p><em><strong>Joueurs connectés :</strong></em></p>
                </section>
                <section id="connectedPlayers">
                </section>

              </div>

              <div class="column middle">
                <div id="conteneur">
                  <section id="drawingUser">
                  </section>

                  <canvas id="whiteboard" width="500" height="300">
                    Your browser needs to support canvas in order to be able to play !
                  </canvas>

                  <section id="toolbox">
                    <button id="eraseButton">Tout effacer</button>
                    <button id="thinButton">Fin</button>
                    <button id="thickButton">Épais</button>
                    <button id="blackButton"></button>
                    <button id="redButton"></button>
                    <button id="greenButton"></button>
                    <button id="blueButton"></button>
                  </section>
                </div>
              </div>

              <div class="column right">
                <section id="username">
                </section>
                <div id="chat">
                  <section id="zone_chat">
                  </section>

                  <form action="/" method="post" id="formulaire_chat">
                    <input type="text" name="message" id="message" placeholder=" Votre message..." autofocus />
                    <input type="submit" id="envoi_message" value="Envoyer" />
                  </form>
                </div>
              </div>
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
