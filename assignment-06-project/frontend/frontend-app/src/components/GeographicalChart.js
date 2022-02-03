import * as React from 'react';
import * as d3 from "d3";
import { useState, useEffect } from "react";
import worldMap from '../data/world.geo.json';
import { Typography } from '@mui/material';

const GeographicalChart = () => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            if (loaded) return;
            // const svg = d3.select('body').select('#geo-charts').select('#geo-map-container').select("svg"),
            //     width = 800,
            //     height = 500;
            const svg = d3.select('body').select('#geo-charts').select("svg"),
                width = 800,
                height = 500;
            // Map and projection
            const projection = d3.geoNaturalEarth1()
                .scale(width / 1.3 / Math.PI)
                .translate([width / 2, height / 2])

            svg.append("g")
                .selectAll("path")
                .data(worldMap.features)
                .join("path")
                .attr("fill", "lightgrey")
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .style("stroke", "#fff")

            setLoaded(true);
        })();

    }, [loaded]);


    return (<div>
        <hr />
        <div style={{ marginLeft: '10px' }}>
            <Typography textAlign={"left"} variant='h4'>Indicators values by countries</Typography>
        </div>
        <div id="#geo-map-container">
            <svg id="my_dataviz" width="800" height="500"></svg>
        </div>
    </div>)
}

export default GeographicalChart;