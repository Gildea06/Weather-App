import React, { Component } from 'react';
import * as R from 'ramda';
import moment from 'moment';
import './App.css';

class App extends Component {
  constructor(props) {
      super(props);
      this.state = {
          weather: [],          
          targetUrl: 'http://api.openweathermap.org/data/2.5/forecast?q=London&units=metric&appid=58b0d1abaa364cba9b7d7d4fe40a8b1b'
      };
  }
  getApiData(route) {
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      return fetch(proxyUrl + this.state.targetUrl)
  }
  componentDidMount() {
      var self = this;
      this.getApiData()
      .then( res => {
          return res.json();
      }).then(jsonData => {
        const isSameDay = (a, b) => {
          return moment(a.dt_txt).isSame(moment(b.dt_txt), 'day')
        }
        const daysGrouped = R.groupWith((a, b) => isSameDay(a, b), jsonData.list);
        const reduceTemps = (acc, cur) => {
          var temp_max = Math.max( acc.main.temp_max, cur.main.temp_max)
          var temp_min = Math.min( acc.main.temp_min, cur.main.temp_min)
          return R.assocPath(['main', 'temp_max'], temp_max, R.assocPath(['main', 'temp_min'], temp_min, cur))
        }
        const fixedTemps =  R.map((day) => day.reduce(reduceTemps), daysGrouped)
        const weather = R.map((day) => {
          const dt_txt =  moment(day.dt_txt).format('dddd');
          return {...day, dt_txt}
        }, fixedTemps)
        self.setState({weather})
      })
      .catch(err => console.log(err))           
  }
  render() {
      var self = this;
      return (
          <div>
            <h3>Forecast</h3>
            <h4>London</h4>          
            <div className="row">
            <div className="col span-1-of-2">
              {this.state.weather.map(ev =>
                  <div className="col span-1-of-6" key={ev.dt}>
                      <h5><a href="#">{ev.dt_txt}</a></h5>
                      <h6><strong>High</strong>: {ev.main.temp_max} &deg;C</h6>
                      <h6>Low: {ev.main.temp_min} &deg;C</h6>
                  </div>
                )}
            </div>
            </div>
          </div>
          
        );      
  }
}


export default App;
