import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Container } from 'reactstrap';

import {
  setZoomInfo,
  setBrushExtent,
} from '../actions/d3Actions';

import './App.css';

import Actions from './Actions';
import NavBar from './NavBar';
import Infos from './Infos';
import Pools from './Pools';
import Selector from './Selector';
import Network from './Network';

const mapStateToProps = state => ({
  ...state,
});

const mapDispatchToProps = dispatch => ({
  setZoomInfoProp: info => dispatch(setZoomInfo(info)),
  setBrushExtentProp: (x0, x1) => dispatch(setBrushExtent(x0, x1)),
});

class App extends Component {
  constructor(props) {
    super(props);
    this.onResize = this.onResize.bind(this);
    this.state = {
      screenWidth: 1000, screenHeight: 500,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize, false);
    this.onResize();
  }

  onResize() {
    this.setState({ screenWidth: window.innerWidth, screenHeight: window.innerHeight - 120 });
  }

  render() {
    const {
      props: {
        buzzard: {
          data,
          filteredData,
          info,
          minDate,
          maxDate,
          minFilteredDate,
          maxFilteredDate,
          nodes,
          links,
        },
        setZoomInfoProp,
        // eslint-disable-next-line
        setBrushExtentProp,
      },
      state: {
        screenWidth,
        // screenHeight,
      },
    } = this;
    const availableWidth = screenWidth - 15 * 2/* bootstrap padding */;

    let body = null;
    if (data.length > 0) {
      body = (
        <div>
          <br />
          <Infos
            allData={data}
            filteredData={filteredData}
            zoomInfo={info}
            dateRange={[minDate, maxDate]}
            filteredDateRange={[minFilteredDate, maxFilteredDate]}
          />
          <br />
          <Selector
            dateRange={[minDate, maxDate]}
            data={data}
            width={availableWidth}
            height={80}
            changeBrush={setBrushExtentProp}
            onHover={setZoomInfoProp}
          />
          <br />
          <Pools
            data={filteredData}
            width={availableWidth}
            height={screenWidth / 4}
          />
          <br />
          <Network
            data={{ nodes, links }}
            width={availableWidth}
            height={Math.max(Math.ceil((nodes.length / links.length) * 150), 250)}
            onHover={setZoomInfoProp}
          />
        </div>
      );
    } else {
      body = (
        <div>
          <br />
          <Alert color="info">
            {'No data received yet. Have you tried to click "Connect"?'}
          </Alert>
        </div>
      );
    }

    return (
      <div>
        <div className="row" style={{ display: 'none' }}>
          <div className="col-12">
            <pre>{ JSON.stringify(this.props) }</pre>
            <pre>{ JSON.stringify(this.state) }</pre>
            <pre>{ JSON.stringify([minDate, maxDate]) }</pre>
            <pre>{ JSON.stringify([minFilteredDate, maxFilteredDate]) }</pre>
          </div>
        </div>
        <NavBar />
        <Container fluid>
          <br />
          <Actions />
          {body}
        </Container>
      </div>
    );
  }
}

App.defaultProps = {};

App.propTypes = {
  buzzard: PropTypes.instanceOf(Object).isRequired,
  setZoomInfoProp: PropTypes.func.isRequired,
  setBrushExtentProp: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
