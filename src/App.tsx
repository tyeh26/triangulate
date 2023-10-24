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
        On land, we rarely have to rely solely on a compass for navigating and orienting ourselves, but if we need, what's the impact of a bit of inaccuracy?

        </Paper>
        <Paper>
          next page
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