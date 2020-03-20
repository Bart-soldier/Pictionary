import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="w3-top">
        <ul>
          <li><a href="https://clerc-dejaham-pictionary.herokuapp.com/" style={{textDecoration: "none"}}><span className="glyphicon glyphicon-home"></span> Home</a></li>
        </ul>
      </div>

      <div className="jumbotron text-center">
        <div className="container">
          <h1>Projet Application Web</h1>
          <p>Test</p>
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
        <p>Original template provided by <a href="https://www.heroku.com/" target="_blank">Heroku</a> and <a href="https://www.w3schools.com/" target="_blank">w3schools.com</a></p>
      </footer>
    </div>
    /*
      <div className="w3-top">
        <ul>
          <li><a href="https://runestone2019-team01.herokuapp.com/" style={{textDecoration: "none"}}><span className="glyphicon glyphicon-home"></span> Home</a></li>
          <li><a onClick={() => this.goTo('/')} className={this.props.router.location.pathname === '/'? 'active': ''} style={{textDecoration: "none"}}>Client</a></li>
          <li><a onClick={() => this.goTo('/camera')}  className={this.props.router.location.pathname === '/camera'? 'active': ''} style={{textDecoration: "none"}}>Camera</a></li>
          <li className="navbar-right"><a href="https://github.com/Haubir/Team1-GSDP" style={{textDecoration: "none"}}><span className="glyphicon glyphicon-book"></span> Repository</a></li>
        </ul>
      </div>*/
  );
}

export default App;
