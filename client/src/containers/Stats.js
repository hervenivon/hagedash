import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { extent } from 'd3-array';
import array from 'lodash/array';

const Stats = ({ filteredData, allData }) => {
  const { length: allLength } = allData;
  const { length: filteredLength } = filteredData;
  const [minDate, maxDate] = extent(allData, d => d.date);
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
    <div className="row">
      <div className="col">
        <span>
          {filteredLength}/{allLength}{' '}records selected over a periode of{' '}{durationMin}{' '}minute(s).{' '}
        </span>
        <span>
          {allUniqQueries.length}{' '}uniq queries.
        </span>
      </div>
    </div>
  );
};

Stats.propTypes = {
  allData: PropTypes.arrayOf(PropTypes.object).isRequired,
  filteredData: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Stats;
