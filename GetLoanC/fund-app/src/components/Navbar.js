import React from 'react';
import {Link} from 'react-router-dom'
const Navbar = ({title}) =>{
 
        return (
            <nav className="navbar bg-primary">
            <h1>
             {title}
            </h1>
            <ul style={{ listStyleType: "none", float: "right", display: "inline"}}>
                <li >
                <Link className="App-link" to='/client'>Customer Information</Link>
                </li>
                <li>
                <Link className="App-link" to='/info'>Eligibility Check</Link>
                </li>
            </ul>
          </nav>
        )
    
}
 Navbar.defaultProps={
  title:'Get Loan App'
};
export default Navbar