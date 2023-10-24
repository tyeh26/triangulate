import React from 'react';
import logo from './logo.svg';
import './App.css';
import Carousel from 'react-material-ui-carousel'
import { Stack, Paper, Button, Divider } from '@mui/material'



import Map from './components/map.js';

function App() {
  return (
    <div className="App">
      <Stack className="Main-content" spacing={2} divider={<Divider flexItem />}>
      <Carousel autoPlay={false}>
        <Paper className="Step-description">
          <h1>Introduction</h1>
          <div>Using a compass and a paper map, you can pinpoint your location.</div>
          <div>How accurrate is it really? How does compass accuracy affect your end result?</div>
          <div>These next few diagrams and graphs will explore triangulation and compass accuracy.</div>
        </Paper>
        <Paper className="Step-description">
          Triangulation overview
        </Paper>
        <Paper className="Step-description">
          Bearing
        </Paper>
        <Paper className="Step-description">
          Bearing/Course error
        </Paper>
        <Paper className="Step-description">
          Triangulation detail & error
        </Paper>
        <Paper className="Step-description">
          Triangulation with collinear points
        </Paper>
        <Paper className="Step-description">
          Triangulation with orthogonal points
        </Paper>
        <Paper className="Step-description">
          Triangulation with multiple points
        </Paper>
        <Paper className="Step-description">
          Conclusion
        </Paper>
      </Carousel>
      <Paper className="Map-container">
        <Map />
      </Paper>
      </Stack>
    </div>
  );
}

export default App;