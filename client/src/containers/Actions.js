import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button,
  ButtonGroup,
  Row,
  Col,
} from 'reactstrap';

import {
  connectAction,
  disconnectAction,
  clearHistoryAction,
  pauseClearingHistory,
  resumeClearingHistory,
  lastOne,
  accumulation,
} from '../actions/websocketActions';

const mapStateToProps = state => ({
  ...state,
});

const mapDispatchToProps = dispatch => ({
  connectActionProp: () => dispatch(connectAction()),
  disconnectActionProp: () => dispatch(disconnectAction()),
  clearHistoryActionProp: () => dispatch(clearHistoryAction()),
  pauseClearingHistoryProp: () => dispatch(pauseClearingHistory()),
  resumeClearingHistoryProp: () => dispatch(resumeClearingHistory()),
  lastOneProp: () => dispatch(lastOne()),
  accumulationProp: () => dispatch(accumulation()),
});

const Actions = ({
  connectActionProp,
  disconnectActionProp,
  pauseClearingHistoryProp,
  resumeClearingHistoryProp,
  clearHistoryActionProp,
  lastOneProp,
  accumulationProp,
}) => (
  <Row className="row align-items-center actionsContainer">
    <Col className="col-12 text-center">
      <ButtonGroup>
        <Button onClick={connectActionProp} color="primary" size="sm">Connect</Button>
        <Button onClick={disconnectActionProp} color="secondary" size="sm">Disconnect</Button>
        <Button onClick={pauseClearingHistoryProp} color="secondary" size="sm">Pause history cleaning</Button>
        <Button onClick={resumeClearingHistoryProp} color="secondary" size="sm">Resume history cleaning</Button>
        <Button onClick={accumulationProp} color="success" size="sm">Accumulation mode</Button>
        <Button onClick={lastOneProp} color="warning" size="sm">Last one mode</Button>
        <Button onClick={clearHistoryActionProp} color="warning" size="sm">Clear history</Button>
      </ButtonGroup>
    </Col>
  </Row>
);

Actions.defaultProps = {};

Actions.propTypes = {
  connectActionProp: PropTypes.func.isRequired,
  disconnectActionProp: PropTypes.func.isRequired,
  pauseClearingHistoryProp: PropTypes.func.isRequired,
  resumeClearingHistoryProp: PropTypes.func.isRequired,
  clearHistoryActionProp: PropTypes.func.isRequired,
  lastOneProp: PropTypes.func.isRequired,
  accumulationProp: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Actions);
