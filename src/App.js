import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Home from './views/Home';
import Play from './views/Play';
import Error from './views/Error';
import Navigation from './views/Navigation';

class App extends Component {
  render() {
    return (
       <BrowserRouter forceRefresh={true}>
        <div>
          <Navigation />
            <Switch>
             <Route path="/" component={Home} exact/>
             <Route path="/play" component={Play}/>
             <Route path='*' component={Error} />
           </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
