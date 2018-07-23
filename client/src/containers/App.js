import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  connectAction,
  disconnectAction,
  clearHistoryAction,
  pauseClearingHistory,
  resumeClearingHistory
} from '../actions/websocketActions'

import './App.css';
import logo from '../logo.svg';

import Stats from './Stats';

const mapStateToProps = state => ({
  ...state
});

const mapDispatchToProps = dispatch => ({
  connectAction: () => dispatch(connectAction()),
  disconnectAction: () => dispatch(disconnectAction()),
  clearHistoryAction: () => dispatch(clearHistoryAction()),
  pauseClearingHistory: () => dispatch(pauseClearingHistory()),
  resumeClearingHistory: () => dispatch(resumeClearingHistory())
});

class App extends Component {
  constructor(props){
    super(props)
    this.onResize = this.onResize.bind(this)
    this.onHover = this.onHover.bind(this)
    this.onBrush = this.onBrush.bind(this)
    this.state = { screenWidth: 1000, screenHeight: 500, hover: "none", brushExtent: [0,40] }
  }

  onResize() {
    this.setState({ screenWidth: window.innerWidth, screenHeight: window.innerHeight - 120 })
  }

  onHover(d) {
    this.setState({ hover: d.id })
  }

  onBrush(d) {
    this.setState({ brushExtent: d })
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize, false)
    this.onResize()
  }

  render() {
    const allData = this.props.buzzard.data;
    const filteredData = allData;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Buzzard realtime dashboard</h1>
        </header>
        <pre>
          {
            JSON.stringify(this.props)
          }
        </pre>

        <pre>
          { JSON.stringify(this.state) }
        </pre>

        <Stats allData={allData} filteredData={filteredData} />
        <br/>
        <div>
          <button onClick={this.props.connectAction}>Connect</button>
          <button onClick={this.props.disconnectAction}>Disconnect</button>
          <button onClick={this.props.clearHistoryAction}>Clear history</button>
          <button onClick={this.props.pauseClearingHistory}>Pause history cleaning</button>
          <button onClick={this.props.resumeClearingHistory}>Resume history cleaning</button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
