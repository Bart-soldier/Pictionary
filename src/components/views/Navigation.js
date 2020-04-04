import React from 'react';

import { NavLink } from 'react-router-dom';

const Navigation = () => {
    return (
       <div className="w3-top">
          <ul>
            <li><NavLink to="/"><span className="glyphicon glyphicon-home"></span> Home</NavLink></li>
            <li><NavLink to="/play">Play</NavLink></li>
          </ul>
       </div>
    );
}

export default Navigation;
