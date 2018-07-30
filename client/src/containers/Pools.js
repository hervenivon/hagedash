import React, { Component } from 'react';
import PropTypes from 'prop-types';
import colorbrewer from 'colorbrewer';
import { format } from 'd3-format';
import { legendColor } from 'd3-svg-legend';
import { mean } from 'd3-array';
import { nest, set } from 'd3-collection';
import { pie, arc } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { select } from 'd3-selection';

/**
 * We are forced to import 'd3-transition' even if not in used. Otherwise 'd3-svg-legend' triggers
 * a Cell.exit().transition not a function encountered
 */
// eslint-disable-next-line
import { transition } from 'd3-transition'

class Pools extends Component {
  static createlegend(node, labels, colorScale) {
    const legend = legendColor()
      .scale(colorScale)
      .orient('horizontal')
      .labelAlign('start')
      .labelWrap(40)
      .labels(labels);

    select(node)
      .selectAll('g.legend')
      .data([0])
      .enter()
      .append('g')
      .attr('class', 'legend')
      .call(legend);
  }

  static createPieChart(node, nestedData, colorScale, width, height, valueFunc) {
    const stroke = 1;
    const radius = height / 2;
    const outerRadius = radius - stroke;
    const innerRadius = outerRadius / 3.5;
    const translationX = width / 2;
    const translationY = outerRadius + stroke;

    const valueFormat = format('.1f');

    const pieChart = pie().padAngle(0.005).sort(null).value(valueFunc);
    const arcs = pieChart(nestedData);
    const arcGenerator = arc().innerRadius(innerRadius).outerRadius(outerRadius);

    const g = select(node).select('g')
      .attr('transform', `translate(${translationX},${translationY})`);

    const paths = g.selectAll('path')
      .data(arcs);

    // What to do when nbr of data elements is different than nbr of DOM elements
    paths.exit().remove();

    // What to do when nbr of data elements is superior than nbr of DOM elements
    paths.enter().insert('path')
      .style('stroke', 'lightgrey')
      .style('stroke-width', `${stroke}px`)
      .append('title');

    // What to do when nbr of data elements equals nbr of DOM elements
    paths.attr('d', arcGenerator)
      .style('fill', (d, i) => colorScale(i))
      .select('title')
      .text(d => `${d.data.key}`);

    const texts = g.selectAll('text')
      .data(arcs);

    texts.exit().remove();

    texts.enter()
      .append('text')
      .append('tspan');

    texts.attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
      .select('tspan')
      .attr('x', '-0.3em')
      .attr('y', '-0.1em')
      .style('font-weight', 'regular')
      .text(d => `${valueFormat(valueFunc(d.data))}`);
  }

  componentDidMount() {
    this.createPoolCharts();
  }

  componentDidUpdate() {
    this.createPoolCharts();
  }

  createPoolCharts() {
    const { data, width, height } = this.props;

    // Data preparation and charts construction only when at least one item has been gathered
    if (data && data.length > 0) {
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

      Pools.createlegend(this.legendRef, poolsSet.values(), colorScale);
      Pools.createlegend(this.typeLegendRef, poolTypesSet.values(), typeColorScale);

      const pieWidth = width / 4;
      const pieHeight = Math.min(pieWidth, height, 150);

      Pools.createPieChart(this.avgWorkerCountPerPoolRef,
        nestedPools, colorScale, pieWidth, pieHeight, d => d.avgWorkerCount);
      Pools.createPieChart(this.avgWorkingCountPerPoolRef,
        nestedPools, colorScale, pieWidth, pieHeight, d => d.avgWorkingCount);
      Pools.createPieChart(this.avgWorkerCountPerPoolTypeRef,
        nestedPoolTypes, typeColorScale, pieWidth, pieHeight, d => d.avgWorkerCount);
      Pools.createPieChart(this.avgWorkingCountPerPoolTypeRef,
        nestedPoolTypes, typeColorScale, pieWidth, pieHeight, d => d.avgWorkingCount);
    }
  }

  render() {
    const { height, width } = this.props;
    const pieWidth = width / 4;
    const pieHeight = Math.min(pieWidth, height, 150);

    const legendWidth = width / 2;
    const legendHeight = 50;

    return (
      <div className="poolsContainer">
        <div className="row align-items-center no-gutters">
          <div className="col-3">
            <svg
              ref={(node) => { this.avgWorkerCountPerPoolRef = node; }}
              width={pieWidth}
              height={pieHeight}
            >
              <g />
            </svg>
          </div>
          <div className="col-3">
            <svg
              ref={(node) => { this.avgWorkingCountPerPoolRef = node; }}
              width={pieWidth}
              height={pieHeight}
            >
              <g />
            </svg>
          </div>
          <div className="col-3">
            <svg
              ref={(node) => { this.avgWorkerCountPerPoolTypeRef = node; }}
              width={pieWidth}
              height={pieHeight}
            >
              <g />
            </svg>
          </div>
          <div className="col-3">
            <svg
              ref={(node) => { this.avgWorkingCountPerPoolTypeRef = node; }}
              width={pieWidth}
              height={pieHeight}
            >
              <g />
            </svg>
          </div>
        </div>
        <div className="row align-items-center">
          <div className="col-6">
            <svg
              ref={(node) => { this.legendRef = node; }}
              width={legendWidth}
              height={legendHeight}
            />
          </div>
          <div className="col-6">
            <svg
              ref={(node) => { this.typeLegendRef = node; }}
              width={legendWidth}
              height={legendHeight}
            />
          </div>
        </div>
      </div>
    );
  }
}

Pools.defaultProps = {
  width: 0,
  height: 0,
};

Pools.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
};

export default Pools;
