import './App.css';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';
import * as React from 'react';
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
import TemporalChart from './components/TemporalChart';

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function App() {
  return (
    <div className="App">
      <CssBaseline />
      <Container maxWidth="l">
        <Grid container spacing={2} direction="row" justifyContent="flex-start">
          {/* <Grid id="information" item md={6}>
            <Typography variant="h3">Title</Typography>
            <Typography >Text</Typography>
          </Grid> */}
          <Grid id="temporal-charts" item md={12}>
            <TemporalChart />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;
