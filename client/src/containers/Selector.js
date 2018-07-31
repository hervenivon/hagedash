import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { axisBottom } from 'd3-axis';
// eslint-disable-next-line
import { brushX, brushSelection } from 'd3-brush';
import { scaleTime } from 'd3-scale';
import { select, event } from 'd3-selection';
import { timeFormat } from 'd3-time-format';
import './App.css';

class Selector extends Component {
  constructor(props) {
    super(props);
    this.createBrush = this.createBrush.bind(this);
  }

  componentDidMount() {
    this.createBrush();
  }

  componentDidUpdate() {
    this.createBrush();
  }

  createBrush() {
    const {
      props: {
        width,
        height,
        changeBrush,
        range,
      },
      node,
    } = this;

    const scale = scaleTime().domain(range)
      .rangeRound([0, width]);

    function brushed() {
      if (!event.sourceEvent) return; // Only transition after input.
      if (!event.selection) { // Clear empty selection.
        changeBrush([null, null]);
        return;
      }
      const selectedExtent = event.selection.map(d => scale.invert(d));

      // (option) implement a snaping like function: https://bl.ocks.org/mbostock/6232537

      changeBrush(selectedExtent); // call the function given function
    }

    const dayBrush = brushX()
      .extent([[0, 0], [width, height]])
      .on('end', brushed);

    const dayAxis = axisBottom()
      .tickFormat(timeFormat('%H:%M:%S')).scale(scale);

    select(node)
      .selectAll('g.brushaxis')
      .data([0])
      .enter()
      .append('g')
      .attr('class', 'brushaxis')
      .attr('transform', `translate(0,${height / 2})`);

    // eslint-disable-next-line
    const theBrush = select(node)
      .select('g.brush')
      .call(dayBrush);

    select(node)
      .select('g.brushaxis')
      .call((d) => {
        dayAxis(d);

        // //@todo Update `App.js` `brushExtent` when data update
        // // Update the brush values on data update
        // const theBrushNode = theBrush.node();
        // if (theBrushNode) {
        //   // dayBrush.extent(dayBrush.extent()); // Reset brush extent on resize
        //   // get current pixel selection
        //   const actualPixelSelection = brushSelection(theBrushNode);
        //   const selectedExtent = (actualPixelSelection || []).map(e => scale.invert(e));
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
    return <svg ref={(node) => { this.node = node; }} width={width} height={height} />;
  }
}

Selector.defaultProps = {
  changeBrush: () => {},
};

Selector.propTypes = {
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  changeBrush: PropTypes.func,
  range: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
};

export default Selector;
