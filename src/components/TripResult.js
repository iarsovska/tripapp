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
                  <strong>{res.departure} > {res.arrival} </strong> 
                  <span className="pull-right">{ res.cost } € </span>
                </div>
                <small>
                  <strong>{res.transport}:</strong> {res.reference} for { Math.floor(res.duration / 60) }h { res.duration % 60 }min 
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