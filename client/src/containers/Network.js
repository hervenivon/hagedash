import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
} from 'reactstrap';

import colorbrewer from 'colorbrewer';
import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { select as d3Select } from 'd3-selection';
import { scaleOrdinal as d3ScaleOrdinal } from 'd3-scale';

import DOM from '../lib/dom';

class Network extends Component {
  constructor(props) {
    super(props);
    this.createSankey = this.createSankey.bind(this);
  }

  componentDidMount() {
    this.createSankey();
  }

  componentDidUpdate() {
    this.createSankey();
  }

  createSankey() {
    const {
      props: {
        data: {
          nodes: originNodes,
          links: originLinks,
        },
        width,
        height,
        nodeColorScale,
        linkColorScale,
        onHover,
      },
      node,
    } = this;

    const sankeyGenerator = d3Sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 1], [width - 1, height - 6]]);

    const sankey = ({ nodes, links }) => sankeyGenerator({
      nodes: nodes.map(d => Object.assign({}, d)),
      links: links.map(d => Object.assign({}, d)),
    });


    // *********************************************************************************************
    //                                   Crafting Sankey data
    // *********************************************************************************************

    const { nodes, links } = sankey({ nodes: originNodes, links: originLinks });

    // *********************************************************************************************
    //                                   Setting Sankey groups
    // *********************************************************************************************

    // add the node group to the main node
    d3Select(node)
      .selectAll('g.nodes')
      .data([0])
      .enter()
      .append('g')
      .attr('class', 'nodes')
      .attr('stroke', '#000');

    d3Select(node)
      .selectAll('g.links')
      .data([0])
      .enter()
      .append('g')
      .attr('class', 'links')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.5);

    d3Select(node)
      .selectAll('g.nodestexts')
      .data([0])
      .enter()
      .append('g')
      .attr('class', 'nodestexts')
      .style('font', '10px sans-serif');

    // *********************************************************************************************
    //                                    Crafting the nodes
    // *********************************************************************************************

    // what to do on enter
    d3Select(node)
      .select('g.nodes')
      .selectAll('rect.node')
      .data(nodes)
      .enter()
      .append('rect')
      .attr('class', 'node')
      .append('title')
      .text(d => `${d.name}\n${d.value} px`);

    // what to do on exit
    d3Select(node)
      .select('g.nodes')
      .selectAll('rect.node')
      .data(nodes)
      .exit()
      .remove();

    // what to do on update
    d3Select(node)
      .select('g.nodes')
      .selectAll('rect.node')
      .data(nodes)
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => nodeColorScale(d))
      .attr('pointer-events', 'visiblePainted') // https://www.w3.org/TR/SVG/interact.html#PointerEventsProperty
      .on('mouseover', d => onHover(
        <span>
          {d.name}
        </span>,
      ))
      .on('mouseout', () => onHover(''))
      .select('title')
      .text(d => `${d.name}\n${d.value} px`);


    // *********************************************************************************************
    //                                    Crafting the links
    // *********************************************************************************************

    // We are not performing normal enter/exit/update D3 scheme here, it has been easier to
    // clean all existing links. If performance issues arise, it will become mandatory
    d3Select(node)
      .select('g.links')
      .selectAll('g.link')
      .remove();

    // what to do on enter
    const link = d3Select(node)
      .select('g.links')
      .selectAll('g.link')
      .data(links)
      .enter()
      .append('g')
      .attr('class', 'link')
      .style('mix-blend-mode', 'multiply');

    const gradient = link.append('linearGradient')
      .attr('id', (d) => {
        d.uid = DOM.uid('link');
        return d.uid.id;
      })
      .attr('pointer-events', 'none')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', d => d.source.x1)
      .attr('x2', d => d.target.x0);

    gradient.append('stop')
      .attr('pointer-events', 'none')
      .attr('offset', '0%')
      .attr('stop-color', d => linkColorScale(d /* .source.name */));

    gradient.append('stop')
      .attr('pointer-events', 'none')
      .attr('offset', '100%')
      .attr('stop-color', d => linkColorScale(d /* .target.name */));

    link.append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => d.uid)
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('pointer-events', 'visiblePainted') // https://www.w3.org/TR/SVG/interact.html#PointerEventsProperty
      .on('mouseover', d => onHover(
        <span>
          {d.source.name}{' ← '}{d.target.name}{' ('}{d.meta.query}{'):'}
          <br />
          {'- root_query_id: '}{d.meta.root_query_id}
          <br />
          {'- '}{d.value}{' px'}
        </span>,
      ))
      .on('mouseout', () => onHover('')); // Bug mouseout is not working

    link.append('title')
      .text(d => `${d.source.name} ← ${d.target.name} (${d.meta.query}):\n- root_query_id: ${d.meta.root_query_id}\n- ${d.value} px`);


    // *********************************************************************************************
    //                                   Crafting nodes' texts
    // *********************************************************************************************

    // what to do on enter
    d3Select(node)
      .select('g.nodestexts')
      .selectAll('text.node')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'node');


    // what to do on exit
    d3Select(node)
      .select('g.nodestexts')
      .selectAll('text.node')
      .data(nodes)
      .exit()
      .remove();

    // what to do on update
    d3Select(node)
      .select('g.nodestexts')
      .selectAll('text.node')
      .data(nodes)
      .attr('x', d => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => (d.x0 < width / 2 ? 'start' : 'end'))
      .text(d => d.name);
  }

  render() {
    const {
      width, height,
    } = this.props;

    return (
      <Row className="row align-items-center no-gutters networkContainer">
        <Col>
          <svg
            ref={(node) => { this.node = node; }}
            style={{ width: '100%', height: 'auto' }}
            width={width}
            height={height}
          />
        </Col>
      </Row>
    );
  }
}

const nodeColorScale = d3ScaleOrdinal(colorbrewer.RdYlBu[11]); // http://colorbrewer2.org/#type=diverging&scheme=RdYlBu&n=11
const linkColorScale = d3ScaleOrdinal(colorbrewer.RdBu[11]); // http://colorbrewer2.org/#type=diverging&scheme=RdBu&n=11

Network.defaultProps = {
  nodeColorScale: (d) => {
    try {
      return nodeColorScale(d.name);
    } catch (e) {
      return nodeColorScale(d);
    }
  },
  linkColorScale: (d) => {
    try {
      if (d.meta.type === 'connection') {
        return '#AEAEAE'; // grey
      }
      return linkColorScale(d.meta.root_query_id);
    } catch (e) {
      return nodeColorScale(d);
    }
  },
  onHover: () => { },
};

Network.propTypes = {
  data: PropTypes.instanceOf(Object).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  nodeColorScale: PropTypes.func,
  linkColorScale: PropTypes.func,
  onHover: PropTypes.func,
};

export default Network;
