/* eslint-disable react/no-multi-comp */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */

/**
 * Inspired from:
 * - https://swizec.com/blog/silky-smooth-piechart-transitions-react-d3js/swizec/8258
 * - https://swizec.com/blog/how-to-make-a-piechart-using-react-and-d3/swizec/6785
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { format } from 'd3-format';
import { interpolate } from 'd3-interpolate';
import { pie, arc } from 'd3-shape';
import { select } from 'd3-selection';

// Inspired from http://bl.ocks.org/mbostock/5100636
function arcTween(oldData, newData, arcFunc) {
  const copy = { ...oldData };
  return () => {
    const interpolateStartAngle = interpolate(
      oldData.startAngle,
      newData.startAngle,
    );
    const interpolateEndAngle = interpolate(
      oldData.endAngle,
      newData.endAngle,
    );

    return (t) => {
      copy.startAngle = interpolateStartAngle(t);
      copy.endAngle = interpolateEndAngle(t);
      return arcFunc(copy);
    };
  };
}

class Arc extends Component {
  arc = arc() // eslint-disable-next-line
    .innerRadius(this.props.innerRadius) // eslint-disable-next-line
    .outerRadius(this.props.outerRadius)
    .cornerRadius(4);

  constructor(props) {
    super(props);

    this.state = {
      color: props.color,
      // origCol: props.color,
      data: props.data,
      pathD: this.arc(props.data),
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      color: newProps.color,
    });

    const { data } = this.state;

    select(this.node)
      .transition()
      .duration(80)
      .attr('d', this.arc(newProps.data))
      .attrTween('d', arcTween(data, newProps.data, this.arc))
      .on('end', () => this.setState({
        data: newProps.data,
        pathD: this.arc(newProps.data),
      }));
  }

  hover = () => {
    // this.setState({
    //   color: this.state.color,
    // });
  };

  unhover = () => {
    // this.setState({
    //   color: this.state.origCol,
    // });
  };

  render() {
    const { color, pathD } = this.state;

    return (
      <path
        d={pathD}
        style={{
          fill: color,
        }}
        onMouseOver={this.hover}
        onMouseOut={this.unhover}
        ref={(node) => { this.node = node; }}
      />
    );
  }
}

class LabeledArc extends Arc {
  render() {
    const [labelX, labelY] = this.arc.centroid(this.props.data);
    const labelTranslate = `translate(${labelX}, ${labelY})`;

    return (
      <g>
        {super.render()}
        <text
          transform={labelTranslate}
          textAnchor="middle"
        >
          {this.props.label}
        </text>
      </g>
    );
  }
}

class Piechart extends Component {
  pie = pie() // eslint-disable-next-line
    .value(this.props.valueFunc) // eslint-disable-next-line
    .sortValues(this.props.keyFunc)
    .padAngle(0.005); // https://bl.ocks.org/mbostock/3e961b4c97a1b543fff2

  render() {
    const {
      data, width, height, colorScale, keyFunc, valueFunc,
    } = this.props;

    const stroke = 1;
    const radius = height / 2;
    const outerRadius = radius - stroke;
    const innerRadius = outerRadius / 3;
    const translationX = width / 2;
    const translationY = outerRadius + stroke;

    const valueFormat = format('.1f');

    return (
      <svg width={width} height={height}>
        <g transform={`translate(${translationX}, ${translationY})`}>
          {this.pie(data).map((d, i) => (
            <LabeledArc
              data={d}
              color={colorScale(i)} /** This has a side effect: doubling the domain size.
                                        That's why we perform copy in Pools component */
              key={keyFunc(d.data)}
              label={valueFormat(valueFunc(d.data))}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
            />
          ))}
        </g>
      </svg>
    );
  }
}

Arc.defaultProps = {
  data: { key: '', values: [] },
  color: '',
  innerRadius: 0,
  outerRadius: 0,
};

Arc.propTypes = {
  data: PropTypes.instanceOf(Object),
  color: PropTypes.string,
  innerRadius: PropTypes.number,
  outerRadius: PropTypes.number,
};

Piechart.defaultProps = {
  width: 0,
  height: 0,
  valueFunc: () => {},
  keyFunc: () => {},
  colorScale: () => {},
};

Piechart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  valueFunc: PropTypes.func,
  keyFunc: PropTypes.func,
  colorScale: PropTypes.func,
};

export default Piechart;
