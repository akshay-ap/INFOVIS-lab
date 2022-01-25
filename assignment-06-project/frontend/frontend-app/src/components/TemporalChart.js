import { Typography } from '@mui/material';
import * as React from 'react';
import { useState } from "react";
import Paper from '@mui/material/Paper';

const TemporalChart = () => {
    const [indicator, setIndicator] = useState("Indicator");
    const [countries, setCountries] = useState([]);
    const [years, setYears] = useState([]);

    return (<Paper>Temporal chart
        <Typography>{indicator}</Typography>
    </Paper>)
}

export default TemporalChart;