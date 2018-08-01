import React, { Component } from 'react';
import PropTypes from 'prop-types';
import colorbrewer from 'colorbrewer';
import { axisBottom } from 'd3-axis';
import { max } from 'd3-array';
import { brushX /* , brushSelection */ } from 'd3-brush';
import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
import { select, event } from 'd3-selection';
import { timeFormat } from 'd3-time-format';
import './App.css';

class Selector extends Component {
  constructor(props) {
    super(props);
    this.createSelector = this.createSelector.bind(this);
  }

  componentDidMount() {
    this.createSelector();
  }

  componentDidUpdate() {
    this.createSelector();
  }

  createSelector() {
    const {
      props: {
        changeBrush,
        data,
        range,
        width,
        height,
      },
      node,
    } = this;

    // *********************************************************************************************
    //                                     d3 preparation
    // *********************************************************************************************

    const maxData = max(data.map((d) => {
      // Forced to use `tmp` assignment, results where undefined otherwise
      const tmp = [d.nbrRasters, d.nbrQueries];
      return max(tmp);
    }));

    const xScale = scaleTime().domain(range).rangeRound([0, width]);
    const yScale = scaleLinear().domain([0, maxData]).range([0, height / 2]);

    const colorScale = scaleOrdinal().domain(['queries', 'rasters']).range(colorbrewer.YlGnBu[3]);

    const dayAxis = axisBottom()
      .tickFormat(timeFormat('%H:%M:%S')).scale(xScale);

    // *********************************************************************************************
    //                                     Setting bar chart
    // *********************************************************************************************

    select(node)
      .selectAll('g.barchart')
      .data([0])
      .enter()
      .append('g')
      .attr('class', 'barchart');

    select(node)
      .select('g.barchart')
      .selectAll('rect.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar');

    select(node)
      .select('g.barchart')
      .selectAll('rect.bar')
      .data(data)
      .exit()
      .remove();

    const barWidth = width / data.length;

    select(node)
      .select('g.barchart')
      .selectAll('rect.bar')
      .data(data)
      .attr('x', (d, i) => i * barWidth)
      .attr('y', d => (height / 3) * 2 - yScale(d.nbrRasters))
      .attr('height', d => yScale(d.nbrRasters))
      .attr('width', barWidth)
      .style('fill', colorScale('rasters')) // (d, i) => colorScale('rasters')
      .style('stroke', 'black')
      .style('stroke-opacity', 0.25);

    // *********************************************************************************************
    //                              Setting brush's elements and Axis
    // *********************************************************************************************

    function brushed() {
      if (!event.sourceEvent) return; // Only transition after input.
      if (!event.selection) { // Clear empty selection.
        changeBrush([null, null]);
        return;
      }
      const selectedExtent = event.selection.map(d => xScale.invert(d));

      // (option) implement a snapping like function: https://bl.ocks.org/mbostock/6232537

      changeBrush(selectedExtent); // call the function given function
    }

    const dayBrush = brushX()
      .extent([[0, 0], [width, height]])
      .on('end', brushed);

    select(node)
      .selectAll('g.selectoraxis')
      .data([0])
      .enter()
      .append('g')
      .attr('class', 'selectoraxis')
      .attr('transform', `translate(0,${(height / 3) * 2})`);

    // eslint-disable-next-line
    const theBrush = select(node)
      .select('g.brush')
      .call(dayBrush);

    select(node)
      .select('g.selectoraxis')
      .call((d) => {
        dayAxis(d);

        // // @todo Update `App.js` `brushExtent` when data update
        // // Don't forget to remove the comment in the import
        // // Update the brush values on data update
        // const theBrushNode = theBrush.node();
        // if (theBrushNode) {
        //   // dayBrush.extent(dayBrush.extent()); // Reset brush extent on resize
        //   // get current pixel selection
        //   const actualPixelSelection = brushSelection(theBrushNode);
        //   const selectedExtent = (actualPixelSelection || []).map(e => xScale.invert(e));
        //   // the following stops the react refresh 'event loop'
        //   // if (actualPixelSelection) changeBrush(selectedExtent);
        //   // the following used to triggers an exception (Maximum update depth exceeded) until
        //   // I conditioned the App.onBrush function:
        //   changeBrush(selectedExtent); // call the function given function
        // }
      });

    select(node)
      .selectAll('g.brush')
      .data([0])
      .enter()
      .append('g')
      .attr('class', 'brush')
      .attr('transform', 'translate(0,0)');
  }

  render() {
    const { width, height } = this.props;
    return (
      <div className="row align-items-center no-gutters selectorContainer">
        <div className="col-12">
          <svg ref={(node) => { this.node = node; }} width={width} height={height} />
        </div>
      </div>
    );
  }
}

Selector.defaultProps = {
  changeBrush: () => { },
};

Selector.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  changeBrush: PropTypes.func,
  range: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
};

export default Selector;
