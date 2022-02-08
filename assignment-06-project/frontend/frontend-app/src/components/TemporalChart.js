import { Grid, Typography } from '@mui/material';
import * as React from 'react';
import { useContext, useEffect, useState } from "react";
import Paper from '@mui/material/Paper';
import AppContext from './AppContext';
import { getTemporalChartData } from '../api'
import { incomeGroupColors } from '../constants';
import * as d3 from "d3";

const TemporalChart = () => {

    const { selectingData, selectedIndicators, selectedCountries } = useContext(AppContext);
    const [data, setData] = useState(null);
    const YEAR_MIN = 2000;
    const YEAR_MAX = 2019;
    const countries = selectedCountries;

    useEffect(() => {
        (async () => {
            if (!selectingData) {
                const result = await getTemporalChartData(selectedCountries, [], selectedIndicators);
                console.log("getTemporalChartData", result)

                // addLegend(incomeGroupColors);
                selectedIndicators.forEach((i, index) => {
                    const chartData = result.filter(e => e["Indicator_Name"] === i);
                    drawChart(`#temporal-chart-${index}`, chartData, incomeGroupColors)

                })

            }
        })()

    }, [selectingData, selectedIndicators, selectedCountries]);

    const drawChart = (divId, chartData, incomeGroupColors) => {
        var transformedData = []
        var YMin = Number.MAX_VALUE, YMax = Number.MIN_VALUE;

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

        console.log("transformedData", divId, transformedData)

        // set the dimensions and margins of the graph
        const margin = { top: 10, right: 100, bottom: 30, left: 30 },
            width = 360 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

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


        // Add X axis --> it is a date format
        const x = d3.scaleLinear()
            .domain([YEAR_MIN, YEAR_MAX + 1])
            .range([0, width]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(4));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([YMin, YMax])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add the lines
        const line = d3.line()
            .x(d => x(+d.time))
            .y(d => y(+d.value))

        svg.selectAll("myLines")
            .data(dataReady)
            .join("path")
            .attr("class", d => d.name)
            .attr("d", d => line(d.values))
            .attr("stroke", d => incomeGroupColors(d.name))
            .style("stroke-width", 4)
            .style("fill", "none")

        // Add the points
        svg
            // First we need to enter in a group
            .selectAll("myDots")
            .data(dataReady)
            .join('g')
            .style("fill", d => incomeGroupColors(d.name))
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
        //     .style("fill", d => incomeGroupColors(d.name))
        //     .style("font-size", 15)
    }

    // const addLegend = (incomeGroupColors) => {
    //     // Add a legend (TODO: interactive)
    //     d3.select("body")
    //         .select("#temporal-chart-legend").selectAll("*").remove();
    //     const svg =
    //         d3.select("body")
    //             .select("#temporal-chart-legend")
    //             .data(countries)
    //             .join('g')
    //             .append("text")
    //             .attr('x', (d, i) => 60 + i * 100)
    //             .attr('y', 30)
    //             .text(d => d)
    //             .style("fill", d => incomeGroupColors(d))
    //             .style("font-size", 15)
    //             .on("click", function (event, d) {
    //                 // is the element currently visible ?
    //                 var currentOpacity = d3.selectAll("." + d).style("opacity")
    //                 // Change the opacity: from 0 to 1 or from 1 to 0
    //                 d3.selectAll("." + d).transition().style("opacity", currentOpacity === 1 ? 0 : 1)
    //             })
    // }

    function shortenNumber(num, decimalPlaces) {
        var str,
            suffix = '';

        decimalPlaces = decimalPlaces || 0;
        num = +num;

        var factor = Math.pow(10, decimalPlaces);


        //99999 -> 99.9K

        if (num < 1000) {
            str = num;
        } else if (num < 1000000) {
            str = Math.floor(num / (1000 / factor)) / factor;
            suffix = 'K';
        } else if (num < 1000000000) {
            str = Math.floor(num / (1000000 / factor)) / factor;
            suffix = 'M';
        } else if (num < 1000000000000) {
            str = Math.floor(num / (1000000000 / factor)) / factor;
            suffix = 'B';
        } else if (num < 1000000000000000) {
            str = Math.floor(num / (1000000000000 / factor)) / factor;
            suffix = 'T';
        }
        return str + suffix;
    }

    return (
        <div>
            <div style={{ marginLeft: '10px' }}>
                <Typography textAlign={"left"} variant='h4'>Indicators values by income groups</Typography>
                <Typography textAlign={"left"}>Each chart represents one indicator. </Typography>
            </div>
            <div id="temporal-chart-legend"></div>
            <Grid container>
                {/* <Grid id="temporal-chart-legend" item md={12}>s</Grid> */}
                {selectedIndicators.map((element, index) =>
                    <Grid key={`temporal-chart-${index}`} item md={4}>
                        <Paper style={{ margin: '10px', padding: '10px' }}>
                            <Typography style={{ padding: '10px', height: '60px' }}>
                                {selectedIndicators[index]}
                            </Typography>
                            <div id={`temporal-chart-${index}`} ></div>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </div>
    )
}

export default TemporalChart;