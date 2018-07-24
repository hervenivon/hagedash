import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Button } from 'reactstrap';

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
import Pools from './Pools';

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
      <div className="container-fluid">
        <div className="row align-items-center App-header">
          <div className="col-2">
            <img src={logo} className="App-logo" alt="logo" />
          </div>
          <div className="col-10">
            <h1 className="App-title">Buzzard realtime dashboard</h1>
          </div>
        </div>
        <div>
          <pre>
            {
              JSON.stringify(this.props)
            }
          </pre>

          <pre>
            { JSON.stringify(this.state) }
          </pre>
        </div>
        <Stats allData={allData} filteredData={filteredData} />
        <br/>
        <div>
          <Button onClick={this.props.connectAction} color="primary">Connect</Button>{' '}
          <Button onClick={this.props.disconnectAction} color="secondary">Disconnect</Button>{' '}
          <Button onClick={this.props.pauseClearingHistory} color="secondary">Pause history cleaning</Button>{' '}
          <Button onClick={this.props.resumeClearingHistory} color="secondary">Resume history cleaning</Button>{' '}
          <Button onClick={this.props.clearHistoryAction} color="warning">Clear history</Button>
        </div>
        <br/>
        <Pools data={filteredData} size={[this.state.screenWidth, this.state.screenWidth / 4]} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
