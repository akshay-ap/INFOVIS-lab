import { Grid, Typography } from '@mui/material';
import * as React from 'react';
import { useContext, useEffect, useState } from "react";
import Paper from '@mui/material/Paper';
import AppContext from './AppContext';
import { getTemporalChartData } from '../api'
import * as d3 from "d3";

const TemporalChart = () => {

    const { selectingData, selectedIndicators, selectedCountries } = useContext(AppContext);
    const [data, setData] = useState(null);
    const YEAR_MIN = 2000;
    const YEAR_MAX = 2019;

    useEffect(() => {
        (async () => {
            if (!selectingData) {
                const result = await getTemporalChartData(selectedCountries, [], selectedIndicators);
                console.log("getTemporalChartData", result)
                const chartData1 = result.filter(e => e["Indicator_Name"] === selectedIndicators[0]);
                const chartData2 = result.filter(e => e["Indicator_Name"] === selectedIndicators[1]);
                const chartData3 = result.filter(e => e["Indicator_Name"] === selectedIndicators[2]);
                const chartData4 = result.filter(e => e["Indicator_Name"] === selectedIndicators[3]);

                console.log("getTemporalChartData chartData1", chartData1)
                drawChart("#temporal-chart-1", chartData1, selectedCountries)
                drawChart("#temporal-chart-2", chartData2, selectedCountries)
                drawChart("#temporal-chart-3", chartData3, selectedCountries)
                drawChart("#temporal-chart-4", chartData4, selectedCountries)
            }
        })()

    }, [selectingData, selectedIndicators, selectedCountries]);

    const drawChart = (divId, chartData, countries) => {
        var transformedData = []
        var YMin = 0, YMax = 0;

        chartData.forEach(d => {
            var temp = []
            for (var i = YEAR_MIN; i <= YEAR_MAX; i++) {
                temp.push({ "time": i, "value": d[i] })
                if (YMin > d[i]) {
                    YMin = d[i];
                }
                if (YMax < d[i]) {
                    YMax = d[i];
                }
            }
            transformedData.push({ name: d["Country_Name"], values: temp })
        })

        console.log("transformedData", transformedData)

        // set the dimensions and margins of the graph
        const margin = { top: 10, right: 100, bottom: 30, left: 30 },
            width = 560 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        d3.select(divId).selectAll("*").remove();
        // append the svg object to the body of the page
        const svg = d3.select(divId)
            .append("svg")
            .attr("id", "chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        const dataReady = transformedData;

        // A color scale: one color for each group
        const myColor = d3.scaleOrdinal()
            .domain(countries)
            .range(d3.schemeSet2);

        // Add X axis --> it is a date format
        const x = d3.scaleLinear()
            .domain([YEAR_MIN, YEAR_MAX + 1])
            .range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([YMin, YMax])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add the lines
        // const line = d3.line()
        //     .x(d => x(+d.time))
        //     .y(d => y(+d.value))
        // svg.selectAll("myLines")
        //     .data(dataReady)
        //     .join("path")
        //     .attr("class", d => d.name)
        //     .attr("d", d => line(d.values))
        //     .attr("stroke", d => myColor(d.name))
        //     .style("stroke-width", 4)
        //     .style("fill", "none")

        // Add the points
        svg
            // First we need to enter in a group
            .selectAll("myDots")
            .data(dataReady)
            .join('g')
            .style("fill", d => myColor(d.name))
            .attr("class", d => d.name)
            // Second we need to enter in the 'values' part of this group
            .selectAll("myPoints")
            .data(d => d.values)
            .join("circle")
            .attr("cx", d => x(d.time))
            .attr("cy", d => y(d.value))
            .attr("r", 5)
            .attr("stroke", "white")

        // // Add a label at the end of each line
        // svg
        //     .selectAll("myLabels")
        //     .data(dataReady)
        //     .join('g')
        //     .append("text")
        //     .attr("class", d => d.name)
        //     .datum(d => { return { name: d.name, value: d.values[d.values.length - 1] }; }) // keep only the last value of each time series
        //     .attr("transform", d => `translate(${x(d.value.time)},${y(d.value.value)})`) // Put the text at the position of the last point
        //     .attr("x", 12) // shift the text a bit more right
        //     .text(d => d.name)
        //     .style("fill", d => myColor(d.name))
        //     .style("font-size", 15)

        // Add a legend (TODO: interactive)
        svg
            .selectAll("myLegend")
            .data(dataReady)
            .join('g')
            .append("text")
            .attr('x', (d, i) => 60 + i * 100)
            .attr('y', 30)
            .text(d => d.name)
            .style("fill", d => myColor(d.name))
            .style("font-size", 15)
            .on("click", function (event, d) {
                // is the element currently visible ?
                var currentOpacity = d3.selectAll("." + d.name).style("opacity")
                // Change the opacity: from 0 to 1 or from 1 to 0
                d3.selectAll("." + d.name).transition().style("opacity", currentOpacity === 1 ? 0 : 1)
            })
    }

    return (
        <div>
            <Typography variant='h2'>1. Temporal charts</Typography>
            {/* <div id="temporal-chart-1"></div> */}
            <Grid container>
                <Grid item md={6}>
                    <Paper id="temporal-chart-1" style={{ height: '450px', margin: '10px' }}>
                        {selectedIndicators[0]}
                    </Paper>
                </Grid>
                <Grid item md={6}>
                    <Paper id="temporal-chart-2" style={{ height: '450px', margin: '10px' }}>
                        {selectedIndicators[1]}
                    </Paper>
                </Grid>
                <Grid item md={6}>
                    <Paper id="temporal-chart-3" style={{ height: '450px', margin: '10px' }}>
                        {selectedIndicators[2]}
                    </Paper>
                </Grid>
                <Grid item md={6}>
                    <Paper id="temporal-chart-4" style={{ height: '450px', margin: '10px' }}>
                        {selectedIndicators[3]}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    )
}

export default TemporalChart;