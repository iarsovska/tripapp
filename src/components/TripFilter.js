import React, { Component } from 'react';
import logo from '../logo.svg';
import './TripFilter.css';
import responseData from '../lib/response.json';

//IR: Results Presentational Component
import TripResult from './TripResult.js';

class TripFilter extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mode: 'duration', //trip mode
      departure: '',    //trip departure location
      arrival: '',      //trip arrival location
      dep_locs: [],     //all departure locations
      arr_locs: [],     //all arrival locations
      all_deals: [],    //all deals with recalculated duration times in minutes and costs with discounts
      deals_path: []    //the search result is stored here
    }
  }

   //IR: Change Trip Mode (Cheapest or Fastest) 
  setMode(e){
    this.setState({ mode: e.target.value });
  }

  //IR: Change Trip Departure Location
  setTripFrom(e){
    this.setState({ departure: e.target.value });
  }

  //IR: Change Trip Arrival Locations
  setTripTo(e){
    this.setState({ arrival: e.target.value });
  }

  //IR: Return all Arrival locations
  getArrivalLocations(){
    var deals = responseData.deals;
    var locs = this.state.arr_locs.slice();

    for(var i = 0; i < deals.length; i++){
      if(!(locs.indexOf(deals[i].arrival) > -1)){
        locs.push(deals[i].arrival);
      }
    }

    this.setState({arr_locs: locs});
  }

  //IR: Return all Departure Loacations
  getDepartureLocations(){
    var deals = responseData.deals;
    var locs = this.state.dep_locs.slice();

    for(var i = 0; i < deals.length; i++){
      if(!(locs.indexOf(deals[i].departure) > -1)){
        locs.push(deals[i].departure);
      }
    }

    this.setState({dep_locs: locs});
  }

  //IR: Reduce & adjust the array format
  // => Returns [ The actual Result, The reduced Array for tracking the deals backwards ]
  mappedJSON(deals){

    // IR: Get all deals(recalculated)
    var mapped = this.state.all_deals;

    //IR: Reduce the array with only shortest durations or lowest costs
    var reduced = this.reduceArray(mapped);
    // console.log(reduced);

    // IR: Structure the array for the algorithm
    var dfinal = this.structureArray(reduced);
    // console.log(dfinal);

    // IR: Return the final path and the reduced array(this is for tracking the path ith all details)
    return [dfinal, reduced];
  }
  
  //IR: Recalculate Deals durration (in minutes) OR Costs with discounts
  recalcArray(deals){
    var mapped = deals.slice();
    mapped.map(d => {
      d.duration = parseInt(d.duration.h) * 60 + parseInt(d.duration.m)
      d.cost = d.cost - (d.cost * ( d.discount / 100 ))
    });
    return mapped;
  }

  //IR: Reduce JSON - keep only shortest durations OR cheapest deals
  reduceArray(mapped){
    var reduced = [];
    var mode = this.state.mode;

    // IR: Warning: findIndex is not compatible with IE
    mapped.map(d => {
      var index = reduced.findIndex(s => (s.departure === d.departure && s.arrival === d.arrival));
      if(index < 0) {
          reduced.push(d);
      } 
      else if(reduced[index][mode] > d[mode]){
        reduced[index] = d;
      }
    });

    return reduced;
  }

  //IR: Structure Array
  structureArray(reduced){
    var o = {};
    reduced.forEach(s => {
      if(o[s.departure]) {
        o[s.departure][s.arrival] = s.duration;
        } else {
        o[s.departure] = {};
        o[s.departure][s.arrival] = s.duration;
        }
    });

    return o;
  }

  //IR: Extract the path backwards (track the nodes)
  trackPath(sp,gtree){
    var result = [];
    if(Array.isArray(sp) && sp.length > 1) {
      for(var i = 0; i < sp.length - 1; ++i) {
        var found = gtree.find(m => m.departure === sp[i] && m.arrival === sp[i+1]);

        if(found) {
          result.push(found);
        }
      }
    }
    return result;
  }

  //>>>>>>>>>>>>>>> IR: Need to make a separate Component out of this
  //SHORTEST PATH DJIKSTRA IMPLEMENTATION
  createGraph(g){
    var Graph = (function (undefined) {

        var extractKeys = function (obj) {
          var keys = [], key;
          for (key in obj) {
              Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
          }
          return keys;
        }

        var sorter = function (a, b) {
          return parseFloat (a) - parseFloat (b);
        }

        var findPaths = function (map, start, end, infinity) {
          infinity = infinity || Infinity;

          var costs = {},
              open = {'0': [start]},
              predecessors = {},
              keys;

          var addToOpen = function (cost, vertex) {
            var key = "" + cost;
            if (!open[key]) open[key] = [];
            open[key].push(vertex);
          }

          costs[start] = 0;

          while (open) {
            if(!(keys = extractKeys(open)).length) break;

            keys.sort(sorter);

            var key = keys[0],
                bucket = open[key],
                node = bucket.shift(),
                currentCost = parseFloat(key),
                adjacentNodes = map[node] || {};

            if (!bucket.length) delete open[key];

            for (var vertex in adjacentNodes) {
                if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
                var cost = adjacentNodes[vertex],
                    totalCost = cost + currentCost,
                    vertexCost = costs[vertex];

                if ((vertexCost === undefined) || (vertexCost > totalCost)) {
                  costs[vertex] = totalCost;
                  addToOpen(totalCost, vertex);
                  predecessors[vertex] = node;
                }
              }
            }
          }

          if (costs[end] === undefined) {
            return null;
          } else {
            return predecessors;
          }
        }

        var extractShortest = function (predecessors, end) {
          var nodes = [],
              u = end;

          while (u !== undefined) {
            nodes.push(u);
            u = predecessors[u];
          }

          nodes.reverse();
          return nodes;
        }

        var findShortestPath = function (map, nodes) {
          var start = nodes.shift(),
              end,
              predecessors,
              path = [],
              shortest;

          while (nodes.length) {
            end = nodes.shift();
            predecessors = findPaths(map, start, end);

            if (predecessors) {
              shortest = extractShortest(predecessors, end);
              if (nodes.length) {
                path.push.apply(path, shortest.slice(0, -1));
              } else {
                return path.concat(shortest);
              }
            } else {
              return null;
            }

            start = end;
          }
        }

        var toArray = function (list, offset) {
          try {
            return Array.prototype.slice.call(list, offset);
          } catch (e) {
            var a = [];
            for (var i = offset || 0, l = list.length; i < l; ++i) {
              a.push(list[i]);
            }
            return a;
          }
        }

        var Graph = function (map) {
          this.map = map;
        }

        Graph.prototype.findShortestPath = function (start, end) {
          if (Object.prototype.toString.call(start) === '[object Array]') {
            return findShortestPath(this.map, start);
          } else if (arguments.length === 2) {
            return findShortestPath(this.map, [start, end]);
          } else {
            return findShortestPath(this.map, toArray(arguments));
          }
        }

        Graph.findShortestPath = function (map, start, end) {
          if (Object.prototype.toString.call(start) === '[object Array]') {
            return findShortestPath(map, start);
          } else if (arguments.length === 3) {
            return findShortestPath(map, [start, end]);
          } else {
            return findShortestPath(map, toArray(arguments, 1));
          }
        }

        return Graph;

      })();

      var res = new Graph(g);
      return res;
  }

  //IR: Find the results
  findResults(){

      var alldeals = responseData.deals;

      //IR:Map deals by Shortest Path or Cost
      var gtree = this.mappedJSON(alldeals);

      //IR: Create the graph for the 
      var res = this.createGraph(gtree[0]);
      var thepath = res.findShortestPath(this.state.departure,this.state.arrival);

      var trackedPath = this.trackPath(thepath,gtree[1]);
      var deals_path = this.state.deals_path.slice();

      //IR: Set the result deals array in the state
      deals_path = trackedPath;
      this.setState({ deals_path });

      return trackedPath;
  }

  //IR: Reset Results
  resetResults(){
    var results = this.state.deals_path.slice();
    results = [];
    this.setState({ deals_path: [] })
  }

  
  componentDidMount() {
    //IR: Fill filter inputs dynamically after component mount
    this.getDepartureLocations();
    this.getArrivalLocations();

      // IR: Initially map the array with durations calculated in minutes only & costs with discounts
      var mapped = this.recalcArray(responseData.deals);
      var all_deals = this.state.all_deals.slice();
      all_deals = [...mapped];
      this.setState({ all_deals })
  }


  render() {
    return (
      <div className="TripFilter do-trip-filter">
      
          <form className="form" >
            <div className="form-group">
              <label>From:</label>
              <select name="loc_from" className="form-control" onChange={ this.setTripFrom.bind(this) } >
                 <option value="">From</option>
                //IR: Loading Departure Locations from json | Don't show location if it's selected as Arrival location
                { this.state.dep_locs.map( loc => this.state.arrival != loc ? <option value={loc}>{loc}</option> : '' ) }
              </select>
            </div>
            <div className="form-group">
              <label>To:</label>
              <select name="loc_to" className="form-control" onChange={ this.setTripTo.bind(this) } >
                <option value="">To</option>
                //IR: Loading Arrival Locations from json | Don't show location if it's selected as Departure location
                { this.state.arr_locs.map( loc => this.state.departure != loc ?  <option value={loc}>{loc}</option> : '' ) }
              </select>
            </div>
            <div className="btn-group text-center" data-toggle="buttons">
              <label className={this.state.mode ==='cost' ? 'active form-control btn btn-sm btn-primary' : 'btn form-control btn-sm btn-primary'}>
                <input type="radio" name="trip_mode" id="trip_mode_1" 
                  value="cost" 
                  autoComplete="off" 
                  checked={ this.state.mode === 'cost' } 
                  onChange={ this.setMode.bind(this)} />
                 Cheapest
              </label>
              <label className={this.state.mode ==='duration' ? 'active form-control form-control btn btn-sm btn-primary' : 'btn form-control btn-sm btn-primary'}>
                <input type="radio" name="trip_mode" id="trip_mode_2" 
                    value="duration" 
                    autoComplete="off" 
                    checked={ this.state.mode === 'duration' }
                    onChange={ this.setMode.bind(this) } /> 
                  Fastest
              </label>
            </div>
            <div className="form-group">
              <button onClick={ this.findResults.bind(this) } type="button" className=" form-control btn btn-success">Search</button>
            </div>

          </form>
          
          <TripResult searchResults={ this.state.deals_path } />

          <button onClick={ this.resetResults.bind(this) } className="form-control btn btn-danger" type="button">Reset</button>

      </div>
    );
  }
}


export default TripFilter;