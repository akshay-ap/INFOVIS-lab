import './App.css';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';
import * as React from 'react';
import Container from '@mui/material/Container';

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
        <Grid container spacing={2}>
          <Grid item md={12}>
            Diagram 1
          </Grid>
          <Grid item md={12}>
            <Item>test</Item>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;
