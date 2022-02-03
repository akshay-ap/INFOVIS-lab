import React from "react";
import { incomeGroupColors, incomeGroups } from '../constants';
import { Grid, Typography } from '@mui/material';

const LegendIncomeGroups = () => {

    return (<div id='legend-income-groups'>
        <Typography style={{ marginLeft: '10px' }} variant="h5" textAlign={"left"}>Legend (income groups)</Typography>
        <Grid container>
            {incomeGroups.map((element, index) =>
                <Grid container key={`legend-income-groups-${index}`} item md={12}>
                    <Grid item md={1}>
                        <svg width="20" height="20">
                            <rect width="20" height="20" fill={incomeGroupColors(element)} />
                        </svg>
                    </Grid>
                    <Grid item md={6}>
                        <Typography textAlign={"left"}>{incomeGroups[index]}</Typography>
                    </Grid>
                </Grid>
            )}
        </Grid>

    </div >)
}

const LegendIndicators = ({ indicatorColors, indicators }) => {
    return (<div id='legend-indicators'>
        <Typography style={{ marginLeft: '10px' }} variant="h5" textAlign={"left"}>Legend (indicators)</Typography>
        <Grid container>
            {indicators.map((element, index) =>
                <Grid container key={`legend-indicators-${index}`} item md={12}>
                    <Grid item md={1}>
                        <svg width="20" height="20">
                            <rect width="20" height="20" fill={indicatorColors(element)} />
                        </svg>
                    </Grid>
                    <Grid item md={10}>
                        <Typography textAlign={"left"}>{element}</Typography>
                    </Grid>
                </Grid>
            )}
        </Grid>
    </div >)
}

export {
    LegendIncomeGroups,
    LegendIndicators
}