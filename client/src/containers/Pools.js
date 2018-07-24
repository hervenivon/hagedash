import React, { Component } from 'react'
import colorbrewer from 'colorbrewer'
import { legendColor } from 'd3-svg-legend'
import { mean } from 'd3-array'
import { nest, set } from 'd3-collection'
import { pie, arc } from 'd3-shape'
import { scaleOrdinal } from 'd3-scale'
import { select } from 'd3-selection'
import { transition } from 'd3-transition' // forced to import, otherwise a Cell.exit().transition not a function encountered

class Pools extends Component {
  constructor(props) {
    super(props);
    this.createPoolCharts = this.createPoolCharts.bind(this);
  }

  componentDidMount() {
    this.createPoolCharts();
  }

  componentDidUpdate() {
    this.clearCharts();
    this.createPoolCharts();
  }

  _pieChart(node, nestedData, colorScale, valueFunc) {
    const stroke = 1;
    const width = Math.min(this.props.size[0] / 4);
    const height = Math.min(this.props.size[0] / 4, 150);
    const outerRadius = height / 2 - stroke * 2;
    const innerRadius = outerRadius / 3.5;
    const translationX = width / 2 + stroke;
    const translationY = outerRadius + stroke;

    const pieChart = pie();
    const newArc = arc();

    newArc
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    pieChart.value(valueFunc);

    const valuedPie = pieChart(nestedData);

    let paths = select(node)
      .selectAll("path")
      .data(valuedPie);

    paths.enter()
      .append("path")
      .attr("transform", `translate(${translationX},${translationY})`)
      .attr("d", newArc)
      .style("fill", (d, i) => colorScale(i))
      .style("stroke", "lightgrey")
      .style("stroke-width", `${stroke}px`);

    paths.exit()
      .remove();
  }

  _legend(node, labels, colorScale) {
    const legend = legendColor()
      .scale(colorScale)
      .orient("horizontal")
      .labelAlign("start")
      .labelWrap(40)
      .labels(labels);

    select(node)
      .selectAll("g.legend")
      .data([0])
      .enter()
      .append("g")
      .attr("class", "legend")
      .call(legend)
  }

  clearCharts() {
    // from https://github.com/wonism/react-d3-pie-chart/blob/master/src/react-d3-pie-chart.jsx
    // This is awful, the select.exit().remove() should work

    select(this.legendRef)
      .selectAll('*')
      .remove();

    select(this.typeLegendRef)
      .selectAll('*')
      .remove();

    select(this.avgWorkerCountPerPoolRef)
      .selectAll('*')
      .remove();

    select(this.avgWorkingCountPerPoolRef)
      .selectAll('*')
      .remove();

    select(this.avgWorkerCountPerPoolTypeRef)
      .selectAll('*')
      .remove();

    select(this.avgWorkingCountPerPoolTypeRef)
      .selectAll('*')
      .remove();
  }

  createPoolCharts() {
    const data = this.props.data;

    // Data preparation and charts construction only when at least one item has been gathered
    if (data && data.length > 0) {
      const poolsSet = set();
      const poolTypesSet = set();
      const flatten = data.reduce(function (r, e) {
        const tmp = [];
        for (var key in e.pools) {
          const value = e.pools[key];
          poolsSet.add(key);
          poolTypesSet.add(value.type);
          tmp.push({
            date: e.date,
            pool: key,
            worker_count: value.worker_count,
            working_count: value.working_count,
            type: value.type
          });
        }
        r = r.concat(tmp);
        return r;
      }, []);
      const nestedPools = nest().key(d => d.pool).entries(flatten);
      const nestedPoolTypes = nest().key(d => d.type).entries(flatten);

      nestedPools.forEach(d => {
        d.avgWorkerCount = mean(d.values, p => p.worker_count);
        d.avgWorkingCount = mean(d.values, p => p.working_count);
      });

      nestedPoolTypes.forEach(d => {
        d.avgWorkerCount = mean(d.values, p => p.worker_count);
        d.avgWorkingCount = mean(d.values, p => p.working_count);
      });

      const colorScale = scaleOrdinal().domain(poolsSet.values()).range(colorbrewer.Greens[6]);
      const typeColorScale = scaleOrdinal().domain(poolTypesSet.values()).range(colorbrewer.Blues[6]);

      this._legend(this.legendRef, poolsSet.values(), colorScale);
      this._legend(this.typeLegendRef, poolTypesSet.values(), typeColorScale);

      this._pieChart(this.avgWorkerCountPerPoolRef, nestedPools, colorScale, d => d.avgWorkerCount);
      this._pieChart(this.avgWorkingCountPerPoolRef, nestedPools, colorScale, d => d.avgWorkingCount);
      this._pieChart(this.avgWorkerCountPerPoolTypeRef, nestedPoolTypes, typeColorScale, d => d.avgWorkerCount);
      this._pieChart(this.avgWorkingCountPerPoolTypeRef, nestedPoolTypes, typeColorScale, d => d.avgWorkingCount);
    }
  }

  render() {
    const width = this.props.size[0] / 4;
    const height = Math.min(this.props.size[0] / 4, 150);

    const legendWidth = this.props.size[0] / 2;
    const legendHeight = 50;

    return <div className="poolsContainer">
      <div className="row align-items-center">
        <div className="col-3">
          <svg ref={node => this.avgWorkerCountPerPoolRef = node} width={width} height={height}></svg>
        </div>
        <div className="col-3">
          <svg ref={node => this.avgWorkingCountPerPoolRef = node} width={width} height={height}></svg>
        </div>
        <div className="col-3">
          <svg ref={node => this.avgWorkerCountPerPoolTypeRef = node} width={width} height={height}></svg>
        </div>
        <div className="col-3">
          <svg ref={node => this.avgWorkingCountPerPoolTypeRef = node} width={width} height={height}></svg>
        </div>
      </div>
      <div className="row align-items-center">
        <div className="col-6">
          <svg ref={node => this.legendRef = node} width={legendWidth} height={legendHeight}></svg>
        </div>
        <div className="col-6">
          <svg ref={node => this.typeLegendRef = node} width={legendWidth} height={legendHeight}></svg>
        </div>
      </div>
    </div>;
  }
}

export default Pools;