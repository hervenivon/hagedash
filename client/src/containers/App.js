import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Button } from 'reactstrap';

import {
  connectAction,
  disconnectAction,
  clearHistoryAction,
  pauseClearingHistory,
  resumeClearingHistory,
} from '../actions/websocketActions';

import './App.css';
import logo from '../logo.svg';

import Stats from './Stats';
import Pools from './Pools';

const mapStateToProps = state => ({
  ...state,
});

const mapDispatchToProps = dispatch => ({
  connectActionProp: () => dispatch(connectAction()),
  disconnectActionProp: () => dispatch(disconnectAction()),
  clearHistoryActionProp: () => dispatch(clearHistoryAction()),
  pauseClearingHistoryProp: () => dispatch(pauseClearingHistory()),
  resumeClearingHistoryProp: () => dispatch(resumeClearingHistory()),
});

class App extends Component {
  constructor(props) {
    super(props);
    this.onResize = this.onResize.bind(this);
    this.onHover = this.onHover.bind(this);
    this.onBrush = this.onBrush.bind(this);
    this.state = {
      screenWidth: 1000, screenHeight: 500, hover: 'none', brushExtent: [0, 40],
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize, false);
    this.onResize();
  }

  onResize() {
    this.setState({ screenWidth: window.innerWidth, screenHeight: window.innerHeight - 120 });
  }

  onHover(d) {
    this.setState({ hover: d.id });
  }

  onBrush(d) {
    this.setState({ brushExtent: d });
  }

  render() {
    const {
      props: {
        buzzard: {
          data: allData,
        },
        connectActionProp,
        disconnectActionProp,
        pauseClearingHistoryProp,
        resumeClearingHistoryProp,
        clearHistoryActionProp,
      },
      state: {
        screenWidth,
        // screenHeight,
      },
    } = this;
    const filteredData = allData;

    return (
      <div className="container-fluid">
        <div style={{ display: 'none' }}>
          <pre>{ JSON.stringify(this.props) }</pre>
          <pre>{ JSON.stringify(this.state) }</pre>
        </div>
        <div className="row align-items-center App-header">
          <div className="col-2">
            <img src={logo} className="App-logo" alt="logo" />
          </div>
          <div className="col-10">
            <h1 className="App-title">Buzzard realtime dashboard</h1>
          </div>
        </div>
        <br />
        <Stats allData={allData} filteredData={filteredData} />
        <br />
        <div className="row align-items-center">
          <div className="col-12 text-center">
            <Button onClick={connectActionProp} color="primary">Connect</Button>{' '}
            <Button onClick={disconnectActionProp} color="secondary">Disconnect</Button>{' '}
            <Button onClick={pauseClearingHistoryProp} color="secondary">Pause history cleaning</Button>{' '}
            <Button onClick={resumeClearingHistoryProp} color="secondary">Resume history cleaning</Button>{' '}
            <Button onClick={clearHistoryActionProp} color="warning">Clear history</Button>
          </div>
        </div>
        <br />
        <Pools
          data={filteredData}
          width={screenWidth - 15 * 2/* bootstrap padding */}
          height={screenWidth / 4}
        />
      </div>
    );
  }
}

App.defaultProps = {
  buzzard: {
    data: [],
  },
  connectActionProp: () => {},
  disconnectActionProp: () => {},
  pauseClearingHistoryProp: () => {},
  resumeClearingHistoryProp: () => {},
  clearHistoryActionProp: () => {},
};

App.propTypes = {
  buzzard: PropTypes.instanceOf(Object),
  connectActionProp: PropTypes.func,
  disconnectActionProp: PropTypes.func,
  pauseClearingHistoryProp: PropTypes.func,
  resumeClearingHistoryProp: PropTypes.func,
  clearHistoryActionProp: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
