import React, { Component } from 'react';
import logo from '../logo.svg';
import './TripResult.css';

class TripResult extends Component {

  constructor() {
    super();
  }

  render() {
    return (
      <div className="TripResult">
        <div className="do-results-list">
          <ul>

            { this.props.searchResults.map( res => 
             <li>
                <div> 
                  <strong>{res.departure} &#x21d2; {res.arrival} </strong> 
                  <label className="badge badge-success">{ res.cost } € </label>
                </div>
                <small>
                  By <strong>{res.transport}: </strong> {res.reference} for <label className="text-primary" >{ Math.floor(res.duration / 60) }h { res.duration % 60 }min </label>
                </small>
              </li>
              ) 
            }
          
          </ul>
         </div>    
      </div>
    );
  }
}

export default TripResult;