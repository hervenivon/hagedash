import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { legendColor } from 'd3-svg-legend';
import { select } from 'd3-selection';

/**
 * We are forced to import 'd3-transition' even if not in used. Otherwise 'd3-svg-legend' triggers
 * a Cell.exit().transition not a function encountered
 */
// eslint-disable-next-line
import { transition } from 'd3-transition'

class PiechartLegend extends Component {
  static paintLegend(node, labels, colorScale) {
    const legend = legendColor()
      .shapeWidth(25)
      .shapePadding(10)
      .orient('horizontal')
      .labelAlign('start')
      .labelWrap(30)
      .labels(labels)
      .scale(colorScale);

    select(node)
      .selectAll('g.legend')
      .data([0])
      .enter()
      .append('g')
      .attr('class', 'legend')
      .call(legend);
  }

  componentDidMount() {
    this.clear();
    this.paint();
  }

  componentDidUpdate() {
    this.clear();
    this.paint();
  }

  clear() {
    select(this.node)
      .selectAll('*')
      .remove();
  }

  paint() {
    const { colorScale, labels } = this.props;

    if (labels.length > 0) {
      PiechartLegend.paintLegend(this.node, labels, colorScale);
    }
  }

  render() {
    const { height, width } = this.props;

    return (
      <svg
        ref={(node) => { this.node = node; }}
        width={width}
        height={height}
      />
    );
  }
}

PiechartLegend.defaultProps = {
  height: 0,
  width: 0,
  colorScale: () => {},
};

PiechartLegend.propTypes = {
  height: PropTypes.number,
  width: PropTypes.number,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  colorScale: PropTypes.func,
};

export default PiechartLegend;
