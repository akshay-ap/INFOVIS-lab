import './App.css';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';
import * as React from 'react';
import Container from '@mui/material/Container';
import TemporalChart from './components/TemporalChart';
import GeographicalChart from './components/GeographicalChart';

function App() {
  return (
    <div className="App">
      <CssBaseline />
      <Container maxWidth="l">
        <Grid container spacing={2} direction="row" justifyContent="flex-start">
          {/* <Grid id="information" item md={6}>
            <Typography variant="h3">Title</Typography>
            <Typography >Text</T\ypography>
          </Grid> */}
          <Grid id="temporal-charts" item md={12}>
            <TemporalChart />
          </Grid>
          <Grid id="geogprahical-mal" item md={12}>
            <GeographicalChart />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;
