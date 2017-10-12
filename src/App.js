import React, { Component } from 'react';
import './App.css';
import TripFilter from './components/TripFilter.js';

class App extends Component {

  constructor() {
    super();
    this.state = {
      mode: 'cheapest',
      from: '',
      to: ''
    }
  }

  setMode(e){
    console.log(e.target.value);
    this.setState({ mode: e.target.value });
  }

  render() {
    return (
      <div className="App">
        <h2 className="text-center">Trip Sorter</h2>
        <div className="container"> 
        
          <TripFilter />

        </div>
      </div>
    );
  }
}

export default App;