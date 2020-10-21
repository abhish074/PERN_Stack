import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import './App.css';
import  Navbar  from './components/Navbar';

//components
// import Client_Info from "./components/Client_Info";
import ListInfo from "./components/ListClientInformation";
import Client_Info from './components/Client_Info';


// function App() {
//   return (
//   <Fragment>
//     <Router>
//       <Navbar />
//     <div className="container">
//     <ListInfo />
//       </div>
//       </Router>
//     </Fragment>
//   );
// }
function App() {
  return (
  <Fragment>
    <Router>
      <div className='App'>
        <Navbar />  
        <div className='container'>
            <Switch>
              <Route exact path='/client' component={Client_Info} /> 
              <Route exact path='/info' component={ListInfo} /> 
            </Switch> 
            </div>
      </div>
      </Router>
    </Fragment>
  );
}

export default App;
