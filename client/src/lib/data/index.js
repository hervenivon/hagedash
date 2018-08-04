import array from 'lodash/array';

/**
 * Craft a d3.Sankey compatible object from buzzard's data
 *
 * @param {Array} entries
 * @param {Function} valueFunc
 */
const entriesToSankey = (entries, valueFunc = e => e.total_pixels) => {
  const linksMap = {};
  const links = [];
  let nodes = [];
  let connections = [];

  entries.forEach((e) => {
    Object.keys(e.rasters).forEach((key) => { // go through all rasters of the entry
      const newNode = {
        name: key,
        meta: {
          io_pool_id: e.rasters[key].io_pool_id,
          cache_tiles_state: e.rasters[key].cache_tiles_state,
          computation_pool_id: e.rasters[key].computation_pool_id,
          merge_pool_id: e.rasters[key].merge_pool_id,
          resampling_pool_id: e.rasters[key].resampling_pool_id,
          cached: e.rasters[key].cached,
          fp: e.rasters[key].fp,
          fp_virtual: e.rasters[key].fp_virtual,
          dtype: e.rasters[key].dtype,
          nodata: e.rasters[key].nodata,
          nbands: e.rasters[key].nbands,
          proj4_stored: e.rasters[key].proj4_stored,
          proj4_virtual: e.rasters[key].proj4_virtual,
        },
      };
      nodes.push(newNode);
    });

    Object.keys(e.queries).forEach((key) => { // go through all queries of the entry
      const meta = {
        query: key,
        root_query_id: e.queries[key].root_query_id,
        total_arrays: e.queries[key].total_arrays,
        sent_arrays: e.queries[key].sent_arrays,
        max_waiting: e.queries[key].max_waiting,
        waiting: e.queries[key].waiting,
        total_pixels: e.queries[key].total_pixels,
        sent_pixels: e.queries[key].sent_pixels,
        total_bytes: e.queries[key].total_bytes,
        sent_bytes: e.queries[key].sent_bytes,
        total_area: e.queries[key].total_area,
        sent_area: e.queries[key].sent_area,
      };

      let sourceKey = '';
      const destinationKey = e.queries[key].connection[0];

      if (e.queries[key].connection[1] === null) { /* that is the query's root */
        const rootKey = `root(${key})`;
        const newNode = {
          name: rootKey,
          meta: { ...meta },
        };
        nodes.push(newNode);

        sourceKey = rootKey;
      } else { /* that is a "normal" link between two rasters */
        [, sourceKey] = e.queries[key].connection;
      }

      const linkMapKey = `source(${sourceKey})-destination(${destinationKey})`;
      const tmpValue = valueFunc(e.queries[key]);
      const newLink = {
        value: tmpValue || 1,
        meta: { ...meta, type: 'query' },
      };
      linksMap[linkMapKey] = newLink;
    });

    e.connections.forEach((elt) => { // go through all connections of the entry
      if (elt[1] !== null) {
        const linkKey = `source(${elt[1]})-destination(${elt[0]})`;
        const newConnection = {
          link: linkKey,
          value: 1,
          meta: { type: 'connection' },
        };
        connections.push(newConnection);
      }
    });
  });

  nodes = array.uniqBy(nodes, 'name');
  connections = array.uniqBy(connections, 'link');

  // build node index
  const index = {};
  nodes.forEach((elt, i) => {
    index[elt.name] = i;
  });

  const reg = /source\((.+)\)-destination\((.+)\)/;

  connections.forEach((elt) => {
    const [, sourceKey, targetKey] = reg.exec(elt.link);
    links.push({
      source: index[sourceKey],
      target: index[targetKey],
      value: elt.value,
      meta: elt.meta,
    });
  });

  Object.keys(linksMap).forEach((key) => {
    const [, sourceKey, targetKey] = reg.exec(key);
    links.push({
      source: index[sourceKey],
      target: index[targetKey],
      value: linksMap[key].value,
      meta: linksMap[key].meta,
    });
  });

  return { nodes, links };
};

// eslint-disable-next-line
export { entriesToSankey };
