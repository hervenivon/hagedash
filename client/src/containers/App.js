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
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <pre>
          {
            JSON.stringify(this.props)
          }
        </pre>
        <button onClick={this.props.connectAction}>Connect</button>
        <button onClick={this.props.disconnectAction}>Disconnect</button>
        <button onClick={this.props.clearHistoryAction}>Clear history</button>
        <button onClick={this.props.pauseClearingHistory}>Pause history cleaning</button>
        <button onClick={this.props.resumeClearingHistory}>Resume history cleaning</button>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
