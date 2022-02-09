import { Grid, Typography } from '@mui/material';
import * as React from 'react';
import { useContext, useEffect, useState } from "react";
import Paper from '@mui/material/Paper';
import AppContext from './AppContext';
import { getTemporalChartData } from '../api'
import { incomeGroupColors } from '../constants';
import * as d3 from "d3";
import PropTypes from 'prop-types'

const TemporalChart = () => {

    const { selectingData, selectedIndicators, selectedCountries } = useContext(AppContext);
    const YEAR_MIN = 2000;
    const YEAR_MAX = 2019;

    useEffect(() => {
        (async () => {
            if (!selectingData) {
                const result = await getTemporalChartData(selectedCountries, [], selectedIndicators);
                console.log("getTemporalChartData income_groups", result)

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
        const margin = { top: 10, right: 100, bottom: 30, left: 50 },
            width = 400 - margin.left - margin.right,
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

        // Add X axis --> it is a date format
        const x = d3.scaleLinear()
            .domain([YEAR_MIN, YEAR_MAX + 1])
            .range([0, width]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format("d")));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([YMin, YMax])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

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
            .attr("id", d => {
                return `circle-indicator-income-group-${d.time}`
            })
            .attr("r", 7)
            .attr("stroke", "white")
            .attr('opacity', d => {
                if (d.value === null) return 0.0;
                else return 0.7;
            }).on("mouseover", function (event, d) {
                // console.log("mouseover", this.id)

            }).on('mouseleave', function (event, d) {

            })

        svg.selectAll("myText")
            .data(dataReady)
            .join("g").selectAll("myPoints")
            .data(d => d.values)
            .attr("transform", function (d) {
                return `translate(${d.y},${d.x})`
            })
            .join("text")
            .attr("x", d => x(d.time))
            .attr("y", d => y(d.value))
            .attr("id", (d) => {
                const newId = `text-indicator-income-group-${d.time}`;
                return newId;
            })
            .style("fill", (d) => {
                return "black";
            })
            .text((d) => {
                if (d.value === null) return '';
                else return d3.format(".2s")(d.value);
            }).attr('opacity', 0)
            .style("cursor", "default").on("mouseover", function (event, d) {
                d3.selectAll(`#text-indicator-income-group-${d.time}`).attr('opacity', 1);
                d3.selectAll(`#circle-indicator-income-group-${d.time}`).transition()
                    .duration('200')
                    .attr("r", 15);
            }).on('mouseleave', function (event, d) {
                d3.selectAll(`#text-indicator-income-group-${d.time}`).attr('opacity', 0);
                d3.selectAll(`#circle-indicator-income-group-${d.time}`).transition()
                    .duration('200')
                    .attr("r", 7);
            });
    }


    return (
        <div>
            <div style={{ marginLeft: '10px' }}>
                <Typography textAlign={"left"} variant='h4'>Indicators values by income groups</Typography>
                <Typography textAlign={"left"}>Each chart represents one indicator. </Typography>
            </div>
            <div id="temporal-chart-legend"></div>
            <Grid container>
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