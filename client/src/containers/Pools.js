import React, { Component } from 'react'
import colorbrewer from 'colorbrewer'
import { format } from 'd3-format'
import { legendColor } from 'd3-svg-legend'
import { mean } from 'd3-array'
import { nest, set } from 'd3-collection'
import { pie, arc } from 'd3-shape'
import { scaleOrdinal } from 'd3-scale'
import { select } from 'd3-selection'

// forced to import, otherwise d3-svg-legend triggers a Cell.exit().transition not a function encountered
import { transition } from 'd3-transition'

class Pools extends Component {
  constructor(props) {
    super(props);
    this.createPoolCharts = this.createPoolCharts.bind(this);
  }

  componentDidMount() {
    this.createPoolCharts();
  }

  componentDidUpdate() {
    this.createPoolCharts();
  }

  _pieChart(node, nestedData, colorScale, valueFunc) {
    const stroke = 1;
    const width = Math.min(this.props.size[0] / 4);
    const height = Math.min(this.props.size[0] / 4, 150);
    const radius = height / 2
    const outerRadius = radius - stroke;
    const innerRadius = outerRadius / 3.5;
    const translationX = width / 2 + stroke;
    const translationY = outerRadius + stroke;

    const valueFormat = format(".1f");

    const pieChart = pie().padAngle(0.005).sort(null).value(valueFunc);
    const arcs = pieChart(nestedData);
    const arcGenerator = arc().innerRadius(innerRadius).outerRadius(outerRadius);

    const g = select(node).select("g")
      .attr("transform", `translate(${translationX},${translationY})`);

    const paths = g.selectAll("path")
      .data(arcs);

    // What to do when nbr of data elements is different than nbr of DOM elements
    paths.exit().remove();

    // What to do when nbr of data elements is superior than nbr of DOM elements
    paths.enter().insert("path")
      .style("stroke", "lightgrey")
      .style("stroke-width", `${stroke}px`)
      .append("title");

    // What to do when nbr of data elements equals nbr of DOM elements
    paths.attr("d", arcGenerator)
      .style("fill", (d, i) => colorScale(i))
      .select("title")
      .text(d => `${d.data.key}`);

    const texts = g.selectAll("text")
      .data(arcs);

    texts.exit().remove();

    texts.enter()
      .append("text")
      .append("tspan");

    texts.attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
      .select("tspan")
      .attr("x", "-0.3em")
      .attr("y", "-0.1em")
      .style("font-weight", "regular")
      .text(d => `${valueFormat(valueFunc(d.data))}`);
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
          <svg ref={node => this.avgWorkerCountPerPoolRef = node} width={width} height={height}><g></g></svg>
        </div>
        <div className="col-3">
          <svg ref={node => this.avgWorkingCountPerPoolRef = node} width={width} height={height}><g></g></svg>
        </div>
        <div className="col-3">
          <svg ref={node => this.avgWorkerCountPerPoolTypeRef = node} width={width} height={height}><g></g></svg>
        </div>
        <div className="col-3">
          <svg ref={node => this.avgWorkingCountPerPoolTypeRef = node} width={width} height={height}><g></g></svg>
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