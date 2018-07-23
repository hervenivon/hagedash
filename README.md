# hagedash

Realtime dashboard to support [`buzzard`](https://www.github.com/airware/buzzard) next iteration.

Temporary hosted on https://github.com/HerveNivon/hagedash

# Launching the dashboard server

## Python 2.7

```
$> cd client/build
$> python -m SimpleHTTPServer 3000
```

## Python 3.6

```
$> ./hagedash.py
```

## Development

### Pre requisite

You must have `npm` installed to develop and build the `hagedash` dashboard.

### Starting the dashboard for development purpose

The `hagedash` dashboard is a react application located in the `client` folder of this repository.

To start the live reload feature simply:
```
$> cd client
$> npm start
```

See [`client/README.md`](client/README.md) for more information.

## Build

```
$> cd client
$> npm build
```

See [`client/README.md`](client/README.md) for more information.

### Launch the Mock websocket server

Launch the websocket server. It will create a websocket server on `http://localhost:8001/websocket`.

```
$> ./hagedash_mock.py
```

### Development todo
1. [X] Set the development pipeline (https://reactjs.org/docs/create-a-new-react-app.html)
2. [X] Build the datamanager (file://../hagedash#1/src/)
3. [ ] Build the bar charts
4. [ ] Build the donut chart
5. [ ] Build the timeline chart
6. [ ] Build the brush over timeline for selection
7. [ ] Build the interactive sankey
8. [ ] Set the building process for distribution along with `buzzard`
9. [X] Make the distribution trough `./hagedash.py`
10. [ ] Dispatch the "Connect" action automatically on page load
11. [X] Stop automatic re-connection on manual disconnect
12. [ ] Change logo and header
13. [ ] Add bootstrap to make things nicer
14. [ ] Data validation in the websocket handler
15. [ ] Optimized computed properties (in order to avoid their computation within all components)

### External resources

d3.js:
- https://github.com/d3/d3/wiki/gallery
- Interactive drop down: http://bl.ocks.org/jonahwilliams/2f16643b999ada7b1909
- brush snapping: https://bl.ocks.org/mbostock/6232537
- brush and zoom: https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
- scatterplot brush: https://rajvansia.com/scatterplotbrush-d3-v4.html
- additional brushing:
  - https://www.visualcinnamon.com/2016/07/brush-bar-chart-d3.html
  - http://bl.ocks.org/nbremer/326fb6de768e85261bfd47aa1f497863
- reusable donut chart: https://bl.ocks.org/mbhall88/b2504f8f3e384de4ff2b9dfa60f325e2
- Interactive sankey (no dcjs but d3v3):
  - https://bl.ocks.org/wvengen/2a71af9df0a0655a470d
  - https://github.com/q-m/d3.chart.sankey
- official d3js v4 sankey: https://github.com/d3/d3-sankey
- sankey MBostock: https://beta.observablehq.com/@mbostock/d3-sankey-diagram
- Toward reusable charts: https://bost.ocks.org/mike/chart/

react & d3:
- D3.js in action chapter 9: https://github.com/emeeks/d3_in_action_2/tree/master/chapter9

react, redux, websockets:
- https://medium.com/@ianovenden/redux-websocket-integration-c1a0d22d3189
- https://www.ibm.com/developerworks/library/wa-manage-state-with-redux-p1-david-geary/
- https://medium.com/backticks-tildes/setting-up-a-redux-project-with-create-react-app-e363ab2329b8

- https://github.com/giantmachines/redux-websocket/pull/8/files
- https://gist.github.com/dmichael/9dc767fca93624df58b423d01e485402

- https://medium.com/@notrab/getting-started-with-create-react-app-redux-react-router-redux-thunk-d6a19259f71f
- https://medium.com/@andrewdrummond_52198/04-what-the-thunk-is-react-redux-pt-2-3994c57c09c1

- https://www.fullstackreact.com/30-days-of-react/day-19/
- https://github.com/markerikson/redux-ecosystem-links/blob/master/middleware-sockets-adapters.md
- https://github.com/reduxjs/redux-thunk
- https://blog.logrocket.com/beyond-rest-using-websockets-for-two-way-communication-in-your-react-app-884eff6655f5
- Serving a create-react-app with Flask: https://stackoverflow.com/questions/44209978/serving-a-create-react-app-with-flask
- (interesting, not that much): https://peteris.rocks/blog/real-time-stats-with-websockets-and-react/

data:
- Use d3 to manipulate nested data: http://learnjsdata.com/group_data.html

d3.js, dc.js, crossfilters:
- Interactive Sankey (d3v3): http://bl.ocks.org/tonmcg/570fb0409b6c59768229d5631bc3d77e
- Earthquake, interactive dashboard and brush filter (and brush style): http://bl.ocks.org/d3noob/6077996

Realtime dashboard with websockets:
- https://react.rocks/tag/Realtime
- https://react.rocks/tag/WebSockets
- https://react.rocks/example/iTunes-Remote
- https://www.youtube.com/watch?v=Lc2TA0-gZqg
- https://peteris.rocks/blog/real-time-stats-with-websockets-and-react/

dataviz:
- [Hybrid Sankey diagrams: Visual analysis of multidimensional data for understanding resource use](https://www.sciencedirect.com/science/article/pii/S0921344917301167?via%3Dihub)

css:
- https://getbootstrap.com/docs/4.1/getting-started/introduction/

python:
- https://python-socketio.readthedocs.io/en/latest/