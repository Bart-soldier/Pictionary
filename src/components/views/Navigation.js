import React from 'react';

import { NavLink } from 'react-router-dom';

const Navigation = () => {
    return (
       <div className="w3-top">
          <ul>
            <li><NavLink to="/"><span className="glyphicon glyphicon-home"></span> Home</NavLink></li>
            <li><NavLink to="/play">Play</NavLink></li>
            <li><NavLink to="/contact">Contact</NavLink></li>
          </ul>
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

export default Navigation;
