import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert, Button, ButtonGroup } from 'reactstrap';
import { extent } from 'd3-array';

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
import Selector from './Selector';

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
      screenWidth: 1000, screenHeight: 500, hover: 'none', brushExtent: [null, null],
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
    const { brushExtent: prevBrushExtent } = this.state;
    if (d && d.length === 2 && prevBrushExtent[0] !== d[0] && prevBrushExtent[1] !== d[1]) {
      this.setState({ brushExtent: d });
    } else if (prevBrushExtent[0] !== null && prevBrushExtent[1] !== null) {
      this.setState({ brushExtent: [null, null] }); // reset selection
    }
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
        brushExtent,
      },
    } = this;
    const availableWidth = screenWidth - 15 * 2/* bootstrap padding */;

    /** Processing and filtering data */

    function filterData(e) {
      if (brushExtent[0] === null || brushExtent[1] === null
          || (e.date >= brushExtent[0] && e.date <= brushExtent[1])) {
        return true;
      }
      return false;
    }

    const [minDate, maxDate] = extent(allData, d => d.date);
    const filteredData = allData.filter(filterData);

    const header = (
      <div>
        <div style={{ display: 'none' }}>
          <pre>{ JSON.stringify(this.props) }</pre>
          <pre>{ JSON.stringify(this.state) }</pre>
          <pre>{ JSON.stringify([minDate, maxDate]) }</pre>
        </div>
        <div className="row align-items-center App-header">
          <div className="col-2">
            <img src={logo} className="App-logo" alt="logo" />
          </div>
          <div className="col-10">
            <h2>Buzzard dashboard</h2>
          </div>
        </div>
        <br />
        <div className="row align-items-center">
          <div className="col-12 text-center">
            <ButtonGroup>
              <Button onClick={connectActionProp} color="primary">Connect</Button>{' '}
              <Button onClick={disconnectActionProp} color="secondary">Disconnect</Button>{' '}
              <Button onClick={pauseClearingHistoryProp} color="secondary">Pause history cleaning</Button>{' '}
              <Button onClick={resumeClearingHistoryProp} color="secondary">Resume history cleaning</Button>{' '}
              <Button onClick={clearHistoryActionProp} color="warning">Clear history</Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
    );

    let body = null;
    if (allData.length > 0) {
      body = (
        <div>
          <br />
          <Stats allData={allData} filteredData={filteredData} />
          <br />
          <Selector
            range={[minDate, maxDate]}
            width={availableWidth}
            height={40}
            changeBrush={this.onBrush}
          />
          <br /><br />
          <Pools
            data={filteredData}
            width={availableWidth}
            height={screenWidth / 4}
          />
        </div>
      );
    } else {
      body = (
        <div>
          <br />
          <Alert color="info">
            {'Waiting for data - click "Connect"'}
          </Alert>
        </div>
      );
    }

    return (
      <div className="container-fluid">{header}{body}</div>
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
