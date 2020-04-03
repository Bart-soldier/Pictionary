import React from 'react';
import '../stylesheets/Default.css';

const home = () => {
    return (
      <div className="Home">
        <div className="jumbotron text-center">
          <div className="container">
            <h1>Projet Application Web</h1>
            <p>Home</p>
          </div>
        </div>

        <div className="container">
          <div className="alert alert-info text-center" role="alert">
            To see our code, head to the <a href="https://github.com/Bart-soldier/Pictionary" className="alert-link">Pictionary</a> repository.
          </div>
          <hr/>

          <center>
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

export default home;
