import React from 'react'
import moment from 'moment'
import { extent } from 'd3-array'
import array from 'lodash/array'

export default (props) => {
  const allLength = props.allData.length;
  const filteredLength = props.filteredData.length;
  const [ minDate, maxDate ] = extent(props.allData, d => d.date);
  let durationMin = 0;
  if (minDate && maxDate) {
    durationMin = moment(maxDate).diff(moment(minDate), 'minutes');
  }

  let allUniqQueries = array.uniq(props.allData.reduce(function(r, e) {
    if (e.queries) {
      r = r.concat(Object.keys(e.queries));
    }
    return r;
  }, []));

  return <div>
    <span>{filteredLength}/{allLength} records selected for a periode of {durationMin} minute(s). </span>
    <span>{allUniqQueries.length} uniq queries.</span>
  </div>
}