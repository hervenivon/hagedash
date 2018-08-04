import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
} from 'reactstrap';

import colorbrewer from 'colorbrewer';
import { mean } from 'd3-array';
import { nest, set } from 'd3-collection';
import { scaleOrdinal } from 'd3-scale';

import Piechart from './Piechart';
import PiechartLegend from './PiechartLegend';

class Pools extends Component {
  render() {
    const { data, width, height } = this.props;

    // Data preparation and charts construction only when at least one item has been gathered
    const poolsSet = set();
    const poolTypesSet = set();
    const flatten = data.reduce((r, e) => {
      const tmp = [];

      Object.keys(e.pools).forEach((key) => {
        const value = e.pools[key];
        poolsSet.add(key);
        poolTypesSet.add(value.type);
        tmp.push({
          date: e.date,
          pool: key,
          worker_count: value.worker_count,
          working_count: value.working_count,
          type: value.type,
        });
      });
      r = r.concat(tmp);
      return r;
    }, []);
    const nestedPools = nest().key(d => d.pool).entries(flatten);
    const nestedPoolTypes = nest().key(d => d.type).entries(flatten);

    nestedPools.forEach((d) => {
      d.avgWorkerCount = mean(d.values, p => p.worker_count);
      d.avgWorkingCount = mean(d.values, p => p.working_count);
    });

    nestedPoolTypes.forEach((d) => {
      d.avgWorkerCount = mean(d.values, p => p.worker_count);
      d.avgWorkingCount = mean(d.values, p => p.working_count);
    });

    const colorScale = scaleOrdinal()
      .domain(poolsSet.values())
      .range(colorbrewer.Greens[6]);
    const typeColorScale = scaleOrdinal()
      .domain(poolTypesSet.values())
      .range(colorbrewer.Blues[6]);

    const pieWidth = width / 4;
    const pieHeight = Math.min(pieWidth, height, 120);

    const legendWidth = width / 2;
    const legendHeight = 50;

    return (
      <div className="poolsContainer">
        <Row className="row align-items-center no-gutters">
          <Col className="text-center"><p>Average worker count per pool</p></Col>
          <Col className="text-center"><p>Average working count per pool</p></Col>
          <Col className="text-center"><p>Average worker count per pool type</p></Col>
          <Col className="text-center"><p>Average working count per pool type</p></Col>
        </Row>
        <Row className="row align-items-center no-gutters">
          <Col className="text-center">
            <Piechart
              data={nestedPools}
              colorScale={colorScale.copy()}
              width={pieWidth}
              height={pieHeight}
              valueFunc={d => d.avgWorkerCount}
              keyFunc={d => d.key}
            />
          </Col>
          <Col className="text-center">
            <Piechart
              data={nestedPools}
              colorScale={colorScale.copy()}
              width={pieWidth}
              height={pieHeight}
              valueFunc={d => d.avgWorkingCount}
              keyFunc={d => d.key}
            />
          </Col>
          <Col className="text-center">
            <Piechart
              data={nestedPoolTypes}
              colorScale={typeColorScale.copy()}
              width={pieWidth}
              height={pieHeight}
              valueFunc={d => d.avgWorkerCount}
              keyFunc={d => d.key}
            />
          </Col>
          <Col className="text-center">
            <Piechart
              data={nestedPoolTypes}
              colorScale={typeColorScale.copy()}
              width={pieWidth}
              height={pieHeight}
              valueFunc={d => d.avgWorkingCount}
              keyFunc={d => d.key}
            />
          </Col>
        </Row>
        <Row className="row align-items-center no-gutters">
          <Col className="text-center">
            <PiechartLegend
              labels={poolsSet.values()}
              colorScale={colorScale.copy()}
              width={legendWidth}
              height={legendHeight}
            />
          </Col>
          <Col className="text-center">
            <PiechartLegend
              labels={poolTypesSet.values()}
              colorScale={typeColorScale.copy()}
              width={legendWidth}
              height={legendHeight}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

Pools.defaultProps = {};

Pools.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default Pools;
