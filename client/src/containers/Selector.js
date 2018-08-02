import React, { Component } from 'react';
import PropTypes from 'prop-types';
import colorbrewer from 'colorbrewer';
import { axisBottom } from 'd3-axis';
import { max } from 'd3-array';
import { brushX /* , brushSelection */ } from 'd3-brush';
import { interpolateDate } from 'd3-interpolate';
import {
  scaleBand, scaleLinear, scaleOrdinal, scaleQuantize,
} from 'd3-scale';
import { select /* , event as currentEvent */ } from 'd3-selection';
import { timeFormat } from 'd3-time-format';
import './App.css';

function getArrayOfDates(start, end) {
  if (start === end) {
    return [start];
  }

  const res = [];
  const tmp = new Date(start); // prevent infinite loop if start == end (as object)

  while (tmp <= end) {
    res.push(new Date(tmp));
    tmp.setSeconds(tmp.getSeconds() + 1);
  }
  return res;
}

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
        dateRange,
        width,
        height,
      },
      node,
    } = this;

    // *********************************************************************************************
    //                                     d3 preparation
    // *********************************************************************************************

    const maxData = max(data.map((d) => {
      // Forced to use `tmp` assignment, results where undefined otherwise...
      const tmp = [d.nbrRasters, d.nbrQueries];
      return max(tmp);
    }));

    const keys = ['rasters', 'queries'];
    const domain = getArrayOfDates(dateRange[0], dateRange[1]);
    const rangeX = [0, width];
    const rangeY = [0, height / 2];
    const xScale0 = scaleBand().domain(domain).rangeRound(rangeX).paddingInner(0.1);
    const xScale1 = scaleBand().domain(keys).rangeRound([0, xScale0.bandwidth()]).padding(0.05);
    const yScale = scaleLinear().domain([0, maxData]).range(rangeY);

    const colorScale = scaleOrdinal().domain(keys).range(colorbrewer.YlGnBu[3]);

    // D3's scaleBand doesn't offer an invert function, we build it
    // eslint-disable-next-line
    xScale0.invert = (function () {
      const xScale0Range = xScale0.domain();
      const xScale0Domain = xScale0.range();
      const invertScale = scaleQuantize().domain(xScale0Domain).range(xScale0Range);

      return (x) => {
        const res = new Date(invertScale(x));
        return res;
      };
    }());

    // *********************************************************************************************
    //                                      Setting the axis
    // *********************************************************************************************

    const dayAxisInterpolator = interpolateDate(dateRange[0], dateRange[1]);
    const dayAxis = axisBottom()
      .tickValues([0.0, 0.25, 0.5, 0.75, 1].map(d => new Date(dayAxisInterpolator(d))))
      .tickFormat(timeFormat('%H:%M:%S'))
      .scale(xScale0);


    // *********************************************************************************************
    //                                     Setting bar chart
    // *********************************************************************************************

    select(node)
      .selectAll('g.barchart')
      .data([0])
      .enter()
      .append('g')
      .attr('class', 'barchart');

    // what to do on enter
    select(node)
      .select('g.barchart')
      .selectAll('g.barchartgroup')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'barchartgroup');

    // what to do on exit
    select(node)
      .select('g.barchart')
      .selectAll('g.barchartgroup')
      .data(data)
      .exit()
      .remove();

    // what to do on update
    select(node)
      .select('g.barchart')
      .selectAll('g.barchartgroup')
      .data(data)
      .attr('transform', d => `translate(${xScale0(d.date)},0)`);


    // Dynamic data generation to fit the grouped bar chart schema
    function getXScale1Data(d) {
      return keys.map((k) => {
        let tmpVal;
        if (k === 'rasters') {
          tmpVal = d.nbrRasters;
        }
        if (k === 'queries') {
          tmpVal = d.nbrQueries;
        }
        return { key: k, value: tmpVal };
      });
    }

    // what to do on enter
    select(node)
      .select('g.barchart')
      .selectAll('g.barchartgroup')
      .selectAll('rect.bar')
      .data(d => getXScale1Data(d))
      .enter()
      .append('rect')
      .attr('class', 'bar');

    // what to do on exit
    select(node)
      .select('g.barchart')
      .selectAll('g.barchartgroup')
      .selectAll('rect.bar')
      .data(d => getXScale1Data(d))
      .exit()
      .remove();

    // what to do on update
    select(node)
      .select('g.barchart')
      .selectAll('g.barchartgroup')
      .selectAll('rect.bar')
      .data(d => getXScale1Data(d))
      .attr('x', d => xScale1(d.key))
      .attr('y', d => yScale(d.value))
      .attr('width', xScale1.bandwidth())
      .attr('height', d => (height / 3) * 2 - yScale(d.value))
      .style('fill', d => colorScale(d.key));


    // *********************************************************************************************
    //                              Setting brush's elements and Axis
    // *********************************************************************************************

    function brushed() {
      // // The normal d3 schema is not working, the currentEvent appears being empty all the time
      //
      // if (!currentEvent.sourceEvent) return; // Only transition after input.
      // // eslint-disable-next-line
      // if (!currentEvent.selection) { // Clear empty selection.
      //   changeBrush([null, null]);
      //   return;
      // }
      // // eslint-disable-next-line
      // const selectedExtent = currentEvent.selection.map(d => xScale0.invert(d));
      // we replace it with a trick accessing at the internal __brush variable.

      // eslint-disable-next-line
      const thisBrush = this.__brush;
      if (!thisBrush) return;
      if (!thisBrush.selection) {
        changeBrush([null, null]);
        return;
      }

      const selection = [thisBrush.selection[0][0], thisBrush.selection[1][0]];
      const selectedExtent = selection.map(d => xScale0.invert(d));

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
        //   // the following used to triggers an exception (Maximum update depth exceeded)
        //   changeBrush(selectedExtent); // call the function given function
        // }
      });

    // add the brush group to the main node
    select(node)
      .selectAll('g.brush')
      .data([0])
      .enter()
      .append('g')
      .attr('class', 'brush');
  }

  render() {
    const {
      props: {
        width,
        height,
      },
    } = this;
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
  dateRange: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
};

export default Selector;
