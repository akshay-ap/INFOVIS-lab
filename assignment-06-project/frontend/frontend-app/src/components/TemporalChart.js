import { Grid, Typography } from '@mui/material';
import * as React from 'react';
import { useContext } from "react";
import Paper from '@mui/material/Paper';



const TemporalChart = () => {

    return (
        <div>
            <Typography variant='h2'>1. Temporal charts</Typography>
            <Grid container>
                <Grid item md={6}>
                    <Paper style={{ height: '400px', margin: '10px' }}> Chart 1</Paper>
                </Grid>
                <Grid item md={6}>
                    <Paper style={{ height: '400px', margin: '10px' }}> Chart 2</Paper>
                </Grid>
                <Grid item md={6}>
                    <Paper style={{ height: '400px', margin: '10px' }}> Chart 3</Paper>
                </Grid>
                <Grid item md={6}>
                    <Paper style={{ height: '400px', margin: '10px' }}> Chart 4</Paper>
                </Grid>
            </Grid>
        </div>
    )
}

export default TemporalChart;