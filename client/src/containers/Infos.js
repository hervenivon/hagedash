import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, CardBody, CardHeader, CardText, CardDeck,
} from 'reactstrap';
import moment from 'moment';
import { extent } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import array from 'lodash/array';

const Infos = ({ filteredData, allData, zoomInfo }) => {
  const { length: allLength } = allData;
  const { length: filteredLength } = filteredData;
  const [minDate, maxDate] = extent(allData, d => d.date);
  const [minFilteredDate, maxFilteredDate] = extent(filteredData, d => d.date);
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
    <div className="row statsContainer">
      <div className="col-12">
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
                <p>{zoomInfo}</p>
              </CardText>
            </CardBody>
          </Card>
        </CardDeck>
      </div>
    </div>
  );
};

Infos.defaultProps = {
  zoomInfo: '',
};

Infos.propTypes = {
  allData: PropTypes.arrayOf(PropTypes.object).isRequired,
  filteredData: PropTypes.arrayOf(PropTypes.object).isRequired,
  zoomInfo: PropTypes.string,
};

export default Infos;
