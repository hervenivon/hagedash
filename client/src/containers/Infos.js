import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  CardHeader,
  CardText,
  CardDeck,
  Row,
  Col,
} from 'reactstrap';
import moment from 'moment';
import { timeFormat } from 'd3-time-format';
import array from 'lodash/array';

const Infos = ({
  filteredData,
  allData,
  zoomInfo,
  dateRange,
  filteredDateRange,
}) => {
  const { length: allLength } = allData;
  const { length: filteredLength } = filteredData;
  const [minDate, maxDate] = dateRange;
  const [minFilteredDate, maxFilteredDate] = filteredDateRange;
  const formatDate = timeFormat('%H:%M:%S');

  let durationMin = 0;
  if (minDate && maxDate) {
    durationMin = moment(maxDate).diff(moment(minDate), 'minutes');
  }

  const allUniqQueries = array.uniq(
    allData.reduce((r, e) => {
      if (e.queries) {
        r = r.concat(Object.keys(e.queries));
      }
      return r;
    }, []),
  );

  return (
    <Row className="row align-items-center no-gutters statsContainer">
      <Col>
        <CardDeck>
          <Card>
            <CardHeader>General information</CardHeader>
            <CardBody>
              <CardText>
                <span>
                  {filteredLength}/{allLength}{' '}records selected over a periode of{' '}{durationMin}{' '}minute(s).{' '}
                </span>
                <br />
                <span>
                  {allUniqQueries.length}{' '}uniq queries.{' '}
                </span>
                <br />
                <span>
                  {'Minimum selected Date: '}{formatDate(minFilteredDate)}{' / '}{'Maximum selected Date: '}{formatDate(maxFilteredDate)}
                </span>
              </CardText>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Zoom information</CardHeader>
            <CardBody>
              <CardText>
                {zoomInfo}
              </CardText>
            </CardBody>
          </Card>
        </CardDeck>
      </Col>
    </Row>
  );
};

Infos.defaultProps = {
  zoomInfo: '',
  dateRange: [null, null],
  filteredDateRange: [null, null],
};

Infos.propTypes = {
  allData: PropTypes.arrayOf(PropTypes.object).isRequired,
  filteredData: PropTypes.arrayOf(PropTypes.object).isRequired,
  dateRange: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  filteredDateRange: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  zoomInfo: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.instanceOf(Object),
  ]),
};

export default Infos;
