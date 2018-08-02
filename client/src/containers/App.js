import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Container } from 'reactstrap';
import { extent } from 'd3-array';

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
    this.onBrush = this.onBrush.bind(this);
    this.state = {
      screenWidth: 1000, screenHeight: 500, brushExtent: [null, null],
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize, false);
    this.onResize();
  }

  onResize() {
    this.setState({ screenWidth: window.innerWidth, screenHeight: window.innerHeight - 120 });
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
          info: zoomInfo,
        },
        setZoomInfoProp,
        // eslint-disable-next-line
        setBrushExtentProp,
      },
      state: {
        screenWidth,
        // screenHeight,
        brushExtent,
      },
    } = this;
    const availableWidth = screenWidth - 15 * 2/* bootstrap padding */;

    /**
     * Data filtering
     * any processing handled by the middleware @ src/reducers/websocketReducer.js
     */
    function filterData(e) {
      if (brushExtent[0] === null || brushExtent[1] === null
          || (e.date >= brushExtent[0] && e.date <= brushExtent[1])) {
        return true;
      }
      return false;
    }

    const [minDate, maxDate] = extent(allData, d => d.date);
    const filteredData = allData.filter(filterData);

    let body = null;
    if (allData.length > 0) {
      body = (
        <div>
          <br />
          <Infos allData={allData} filteredData={filteredData} zoomInfo={zoomInfo} />
          <br />
          <Selector
            dateRange={[minDate, maxDate]}
            data={allData}
            width={availableWidth}
            height={80}
            changeBrush={this.onBrush}
            onHover={setZoomInfoProp}
          />
          <br />
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
      <div>
        <div className="row" style={{ display: 'none' }}>
          <div className="col-12">
            <pre>{ JSON.stringify(this.props) }</pre>
            <pre>{ JSON.stringify(this.state) }</pre>
            <pre>{ JSON.stringify([minDate, maxDate]) }</pre>
          </div>
        </div>
        <NavBar />
        <br />
        <Actions />
        <Container fluid>
          {/* {header} */}
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
